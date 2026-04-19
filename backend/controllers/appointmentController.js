const { mssql, poolPromise } = require("../config/db");
const emailService = require('../utils/EmailService');
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});
/*
========================================
AUTO CHECK NO-SHOW
========================================
*/
const autoCheckNoShow = async (pool) => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    await pool.request()
      .input("date", mssql.Date, currentDate)
      .input("time", mssql.Time, currentTime)
      .query(`
        UPDATE Appointments 
        SET status = 'no_show' 
        WHERE status = 'confirmed' 
        AND (appointment_date < @date OR (appointment_date = @date AND appointment_end_time < @time))
      `);
  } catch (e) { console.error("No-show update error", e); }
};

/*
========================================
BOOK APPOINTMENT (Patient)
========================================
*/
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, type } = req.body;

    if (!doctorId || !date || !timeSlot || !type) {
      return res.status(400).json({ message: "doctorId, date, timeSlot, type required" });
    }

    const pool = await poolPromise;

    // 1. Check Slot Format
    if (!timeSlot.includes("-")) return res.status(400).json({ message: "Invalid slot format" });
    const [startRaw, endRaw] = timeSlot.split("-");
    const startTime = startRaw.trim().length === 5 ? startRaw.trim() + ":00" : startRaw.trim();
    const endTime = endRaw.trim().length === 5 ? endRaw.trim() + ":00" : endRaw.trim();

    // 2. Prevent Double Booking
    const doubleBooking = await pool.request()
      .input("docId", mssql.Int, doctorId)
      .input("date", mssql.Date, date)
      .input("start", mssql.Time, startTime)
      .query(`SELECT id FROM Appointments WHERE doctor_id=@docId AND appointment_date=@date AND appointment_start_time=@start AND status IN ('pending','confirmed')`);

    if (doubleBooking.recordset.length > 0) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    // 3. Check Leave Day
    const leaveCheck = await pool.request()
      .input("docId", mssql.Int, doctorId)
      .input("date", mssql.Date, date)
      .query("SELECT id FROM LeaveDays WHERE doctor_id=@docId AND leave_date=@date");

    if (leaveCheck.recordset.length > 0) {
      return res.status(400).json({ message: "Doctor is on leave this day" });
    }

    // 3.5 Prevent Past Booking
    const now = new Date();
    const apptDateTime = new Date(`${date}T${startTime}`);
    // Adjust logic to consider local server time differences if needed, but basic check:
    if (apptDateTime < now) {
      return res.status(400).json({ message: "Cannot book slots in the past" });
    }

    // 4. Get Patient ID
    const patientResult = await pool.request()
      .input("userId", mssql.Int, req.user.id)
      .query(`SELECT id FROM Patients WHERE user_id=@userId`);

    let patientId = patientResult.recordset[0]?.id;
    if (!patientId) {
      const newPatient = await pool.request()
        .input("userId", mssql.Int, req.user.id)
        .query(`INSERT INTO Patients(user_id) OUTPUT INSERTED.id VALUES(@userId)`);
      patientId = newPatient.recordset[0].id;
    }

    // 5. Get Fee & Calculate Earnings
    const doctorData = await pool.request()
      .input("docId", mssql.Int, doctorId)
      .query("SELECT consultation_fee FROM Doctors WHERE id = @docId");

    if (!doctorData.recordset.length) return res.status(404).json({ message: "Doctor profile not found" });
    const fee = parseFloat(doctorData.recordset[0].consultation_fee) || 0;
    const commissionAmt = type === 'online' ? (fee * 0.05) : 0;
    const doctorEarnings = fee - commissionAmt;

    // 6. Generate Meeting Link
    const meetingLink = type === 'online' ? `https://meet.jit.si/healcare-${Date.now()}` : null;

    // 7. Insert Appointment
    const result = await pool.request()
      .input("doctorId", mssql.Int, doctorId)
      .input("patientId", mssql.Int, patientId)
      .input("date", mssql.Date, date)
      .input("startTime", mssql.Time, startTime)
      .input("endTime", mssql.Time, endTime)
      .input("type", mssql.NVarChar, type)
      .input("commission", mssql.Decimal(10, 2), commissionAmt)
      .input("earnings", mssql.Decimal(10, 2), doctorEarnings)
      .input("total", mssql.Decimal(10, 2), fee)
      .input("link", mssql.NVarChar, meetingLink)
      .query(`
        INSERT INTO Appointments(
          doctor_id, patient_id, appointment_date, appointment_start_time, appointment_end_time, 
          consultation_type, status, payment_status, booked_by, commission_amt, doctor_earnings, total_amount, meeting_link, appointment_source
        )
        OUTPUT INSERTED.*
        VALUES(
          @doctorId, @patientId, @date, @startTime, @endTime, 
          @type, 'pending', 'pending', 'patient', @commission, @earnings, @total, @link, 'online'
        )
      `);

    const order = await razorpay.orders.create({
      amount: fee * 100,
      currency: "INR",
      receipt: `appointment_${result.recordset[0].id}`
    });

    res.json({
      appointment: result.recordset[0],
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      message: "Appointment locked. Please proceed to payment."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
};

/*
========================================
BOOK WALK-IN APPOINTMENT (Doctor)
========================================
*/
exports.bookWalkInAppointment = async (req, res) => {
  try {
    const {
      patientName,
      phone,
      age,
      gender,
      bloodGroup,
      date,
      timeSlot
    } = req.body;

    // Required validation
    if (!patientName || !age || !gender || !date || !timeSlot) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const pool = await poolPromise;

    // Get doctor
    const doctorResult = await pool.request()
      .input("userId", mssql.Int, req.user.id)
      .query(`
        SELECT id, consultation_fee 
        FROM Doctors 
        WHERE user_id = @userId
      `);

    if (!doctorResult.recordset.length) {
      return res.status(403).json({ message: "Doctor profile not found" });
    }

    const doctor = doctorResult.recordset[0];
    const fee = parseFloat(doctor.consultation_fee) || 0;

    // Clean slot
    const cleanSlot = timeSlot.replace(/\s/g, "");
    const [startRaw, endRaw] = cleanSlot.split("-");

    const startTime = startRaw.length === 5 ? startRaw + ":00" : startRaw;
    const endTime = endRaw.length === 5 ? endRaw + ":00" : endRaw;

    // Prevent double booking
    const check = await pool.request()
      .input("doctorId", mssql.Int, doctor.id)
      .input("date", mssql.Date, date)
      .input("start", mssql.Time, startTime)
      .query(`
        SELECT id 
        FROM WalkInAppointments
        WHERE doctor_id = @doctorId
        AND appointment_date = @date
        AND appointment_start_time = @start
        AND status IN ('pending','confirmed')
      `);

    if (check.recordset.length > 0) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    // Insert into WALK-IN TABLE ONLY
    const result = await pool.request()
      .input("doctorId", mssql.Int, doctor.id)
      .input("patientName", mssql.NVarChar, patientName)
      .input("phone", mssql.NVarChar, phone || null)
      .input("age", mssql.Int, age)
      .input("gender", mssql.NVarChar, gender)
      .input("bloodGroup", mssql.NVarChar, bloodGroup || null)
      .input("date", mssql.Date, date)
      .input("startTime", mssql.Time, startTime)
      .input("endTime", mssql.Time, endTime)
      .input("fee", mssql.Decimal(10, 2), fee)
      .query(`
        INSERT INTO WalkInAppointments (
          doctor_id,
          patient_name,
          phone_number,
          age,
          gender,
          blood_group,
          appointment_date,
          appointment_start_time,
          appointment_end_time,
          consultation_type,
          status,
          payment_status,
          booked_by,
          commission_amt,
          doctor_earnings,
          total_amount,
          appointment_source
        )
        OUTPUT INSERTED.*
        VALUES (
          @doctorId,
          @patientName,
          @phone,
          @age,
          @gender,
          @bloodGroup,
          @date,
          @startTime,
          @endTime,
          'offline',
          'confirmed',
          'paid',
          'doctor',
          0,
          @fee,
          @fee,
          'walkin'
        )
      `);

    res.json({
      message: "Walk-in appointment created successfully",
      appointment: result.recordset[0]
    });

  } catch (err) {
    console.error("Walk-in error:", err);
    res.status(500).json({
      message: "Walk-in booking failed",
      error: err.message
    });
  }
};

/*
========================================
MOCK PAYMENT SUCCESS
========================================
*/
exports.mockPaymentSuccess = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const pool = await poolPromise;
    let meetingLink = null;
    const appointment = await pool.request()
      .input("id", mssql.Int, appointmentId)
      .query(`SELECT consultation_type FROM Appointments WHERE id=@id`);

    if (!appointment.recordset.length) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.recordset[0].consultation_type === "online") {
      meetingLink = `https://meet.jit.si/healcare-${appointmentId}-${Date.now()}`;
    }

    const result = await pool.request()
      .input("id", mssql.Int, appointmentId)
      .input("meetingLink", mssql.NVarChar, meetingLink)
      .query(`
        UPDATE Appointments
        SET payment_status='paid', status='confirmed', meeting_link = @meetingLink
        OUTPUT INSERTED.*
        WHERE id=@id
      `);
    const updatedApt = result.recordset[0];

    // Trigger confirmation email
    await emailService.sendBookingConfirmation('patient@healcare.com', {
      patientName: 'Valued Patient',
      doctorName: 'Specialist',
      date: updatedApt.appointment_date,
      startTime: updatedApt.appointment_start_time,
      endTime: updatedApt.appointment_end_time,
      type: updatedApt.consultation_type
    });

    res.json(updatedApt);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

/*
========================================
GET DOCTOR APPOINTMENTS
========================================
*/
exports.getDoctorAppointments = async (req, res) => {
  try {
    const pool = await poolPromise;
    await autoCheckNoShow(pool);

    const onlineAppointments = await pool.request()
      .input("userId", mssql.Int, req.user.id)
      .query(`
        SELECT
          a.id,
          a.doctor_id,
          a.patient_id,
          a.appointment_date,
          a.consultation_type,
          a.status,
          a.payment_status,
          a.meeting_link,
          a.appointment_start_time,
          a.appointment_end_time,
          a.booked_by,
          a.commission_amt,
          a.doctor_earnings,
          a.total_amount,
          a.appointment_source,

          CONVERT(VARCHAR(5), a.appointment_start_time, 108) AS start_time,
          CONVERT(VARCHAR(5), a.appointment_end_time, 108) AS end_time,

          p.age,
          p.gender,
          p.phone_number,
          p.address,
          u.name AS patientName,
          u.email AS patientEmail,
          u.profile_image AS patientImage
        FROM Appointments a
        JOIN Doctors d ON a.doctor_id = d.id
        JOIN Patients p ON a.patient_id = p.id
        JOIN Users u ON p.user_id = u.id
        WHERE d.user_id = @userId
      `);

    const walkinAppointments = await pool.request()
      .input("userId", mssql.Int, req.user.id)
      .query(`
        SELECT
          w.id,
          w.doctor_id,
          NULL AS patient_id,
          w.appointment_date,
          w.consultation_type,
          w.status,
          w.payment_status,
          NULL AS meeting_link,
          w.appointment_start_time,
          w.appointment_end_time,
          w.booked_by,
          w.commission_amt,
          w.doctor_earnings,
          w.total_amount,
          w.appointment_source,

          CONVERT(VARCHAR(5), w.appointment_start_time, 108) AS start_time,
          CONVERT(VARCHAR(5), w.appointment_end_time, 108) AS end_time,

          w.age,
          w.gender,
          w.phone_number,
          NULL AS address,
          w.patient_name AS patientName,
          NULL AS patientEmail,
          NULL AS patientImage
        FROM WalkInAppointments w
        JOIN Doctors d ON w.doctor_id = d.id
        WHERE d.user_id = @userId
      `);

    // 🔥 MERGE BOTH
    const result = [
      ...onlineAppointments.recordset,
      ...walkinAppointments.recordset
    ];

    // sort by date/time
    result.sort((a, b) =>
      new Date(b.appointment_date) - new Date(a.appointment_date)
    );

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).send("Doctor appointments error");
  }
};

/*
========================================
GET PATIENT APPOINTMENTS
========================================
*/
exports.getPatientAppointments = async (req, res) => {
  try {
    const pool = await poolPromise;
    await autoCheckNoShow(pool);
    const result = await pool.request()
      .input("userId", mssql.Int, req.user.id)
      .query(`
        SELECT
          a.*,
          CONVERT(VARCHAR(5), a.appointment_start_time, 108) AS start_time,
          CONVERT(VARCHAR(5), a.appointment_end_time, 108) AS end_time,
          d.specialization,
          u.name AS doctorName
        FROM Appointments a
        JOIN Patients p ON a.patient_id = p.id
        JOIN Doctors d ON a.doctor_id = d.id
        JOIN Users u ON d.user_id = u.id
        WHERE p.user_id = @userId
        ORDER BY a.appointment_date DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

/*
========================================
UPDATE APPOINTMENT STATUS (Doctor)
========================================
*/
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, visitSummary, followUpDate } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", mssql.Int, id)
      .input("status", mssql.NVarChar, status)
      .input("summary", mssql.NVarChar, visitSummary || null)
      .input("followUp", mssql.Date, followUpDate || null)
      .query(`
        UPDATE Appointments
        SET status=@status, visit_summary=@summary, follow_up_date=@followUp, 
            follow_up_status = CASE WHEN @followUp IS NOT NULL THEN 'pending' ELSE 'none' END
        OUTPUT INSERTED.*
        WHERE id=@id
      `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Update status error");
  }
};

/*
========================================
RESCHEDULE APPOINTMENT
========================================
*/
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeSlot } = req.body;
    const pool = await poolPromise;
    let [startRaw, endRaw] = timeSlot.includes("-") ? timeSlot.split("-") : [timeSlot, ""];
    if (!endRaw) {
      const [h, m] = startRaw.split(":").map(Number);
      endRaw = `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    const startTime = startRaw.trim().length === 5 ? startRaw.trim() + ":00" : startRaw.trim();
    const endTime = endRaw.trim().length === 5 ? endRaw.trim() + ":00" : endRaw.trim();

    const result = await pool.request()
      .input("id", mssql.Int, id)
      .input("date", mssql.Date, date)
      .input("startTime", mssql.Time, startTime)
      .input("endTime", mssql.Time, endTime)
      .query(`
        UPDATE Appointments
        SET appointment_date=@date, appointment_start_time=@startTime, appointment_end_time=@endTime,
            status='pending', payment_status='pending'
        OUTPUT INSERTED.*
        WHERE id=@id
      `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Reschedule failed");
  }
};

/*
========================================
GET AVAILABLE SLOTS (Leave & Booking Aware)
========================================
*/
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const pool = await poolPromise;
    const selectedDay = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

    // 1. Check Leave Days
    const leaveCheck = await pool.request()
      .input("doctorId", mssql.Int, doctorId)
      .input("date", mssql.Date, date)
      .query("SELECT id FROM LeaveDays WHERE doctor_id = @doctorId AND leave_date = @date");

    if (leaveCheck.recordset.length > 0) return res.json([]);

    // 2. Get All Slots for that day
    const slots = await pool.request()
      .input("doctorId", mssql.Int, doctorId)
      .input("day", mssql.NVarChar, selectedDay)
      .query(`SELECT id, start_time, end_time FROM Slots WHERE doctor_id=@doctorId AND available_day=@day`);

    // 3. Get Booked Appointments for that day
    const booked = await pool.request()
      .input("doctorId", mssql.Int, doctorId)
      .input("date", mssql.Date, date)
      .query(`SELECT appointment_start_time FROM Appointments WHERE doctor_id=@doctorId AND appointment_date=@date AND status IN ('pending','confirmed')`);

    const bookedTimes = booked.recordset.map(b => b.appointment_start_time.toISOString().split('T')[1].substring(0, 5));

    // 4. Filter Available Slots
    const available = slots.recordset.filter(slot => {
      const slotStart = slot.start_time.toISOString().split('T')[1].substring(0, 5);
      return !bookedTimes.includes(slotStart);
    });

    res.json(available);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Slots fetch error" });
  }
};