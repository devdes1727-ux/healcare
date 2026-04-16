const { mssql, poolPromise } = require("../config/db");

/*
========================================
BOOK APPOINTMENT
========================================
*/
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, type } = req.body;

    if (!doctorId || !date || !timeSlot || !type) {
      return res.status(400).json({
        message: "doctorId, date, timeSlot, type required"
      });
    }

    const pool = await poolPromise;

    // ✅ FIX SLOT PARSING (10:00-11:00)
    const [startRaw, endRaw] = timeSlot.split("-");

    const startTime = startRaw.trim().length === 5 ? startRaw.trim() + ":00" : startRaw.trim();
    const endTime = endRaw.trim().length === 5 ? endRaw.trim() + ":00" : endRaw.trim();

    // ✅ FIX WEEKDAY
    const selectedDay = new Date(date).toLocaleDateString("en-US", {
      weekday: "long"
    });

    // SLOT CHECK
    const slotCheck = await pool.request()
      .input("doctorId", mssql.Int, doctorId)
      .input("day", mssql.NVarChar, selectedDay)
      .input("startTime", mssql.Time, startTime)
      .query(`
        SELECT *
        FROM Slots
        WHERE doctor_id=@doctorId
        AND available_day=@day
        AND @startTime >= start_time
        AND @startTime < end_time
      `);

    if (!slotCheck.recordset.length) {
      return res.status(400).json({ message: "Selected slot not available" });
    }

    // PATIENT
    const patientResult = await pool.request()
      .input("userId", mssql.Int, req.user.id)
      .query(`SELECT id FROM Patients WHERE user_id=@userId`);

    let patientId = patientResult.recordset[0]?.id;

    if (!patientId) {
      const newPatient = await pool.request()
        .input("userId", mssql.Int, req.user.id)
        .query(`
          INSERT INTO Patients(user_id)
          OUTPUT INSERTED.id
          VALUES(@userId)
        `);

      patientId = newPatient.recordset[0].id;
    }

    // DUPLICATE CHECK
    const duplicateCheck = await pool.request()
      .input("doctorId", mssql.Int, doctorId)
      .input("patientId", mssql.Int, patientId)
      .input("date", mssql.Date, date)
      .input("startTime", mssql.Time, startTime)
      .query(`
        SELECT id
        FROM Appointments
        WHERE doctor_id=@doctorId
        AND patient_id=@patientId
        AND appointment_date=@date
        AND appointment_start_time=@startTime
      `);

    if (duplicateCheck.recordset.length) {
      return res.status(400).json({ message: "Already booked this slot" });
    }

    // CAPACITY CHECK
    const count = await pool.request()
      .input("doctorId", mssql.Int, doctorId)
      .input("date", mssql.Date, date)
      .input("startTime", mssql.Time, startTime)
      .query(`
        SELECT COUNT(*) as total
        FROM Appointments
        WHERE doctor_id=@doctorId
        AND appointment_date=@date
        AND appointment_start_time=@startTime
      `);

    if (count.recordset[0].total >= slotCheck.recordset[0].max_patients) {
      return res.status(400).json({ message: "Slot full" });
    }

    // INSERT
    const result = await pool.request()
      .input("doctorId", mssql.Int, doctorId)
      .input("patientId", mssql.Int, patientId)
      .input("date", mssql.Date, date)
      .input("startTime", mssql.Time, startTime)
      .input("endTime", mssql.Time, endTime)
      .input("type", mssql.NVarChar, type)
      .query(`
        INSERT INTO Appointments(
          doctor_id,
          patient_id,
          appointment_date,
          appointment_start_time,
          appointment_end_time,
          consultation_type,
          status,
          payment_status
        )
        OUTPUT INSERTED.*
        VALUES(
          @doctorId,
          @patientId,
          @date,
          @startTime,
          @endTime,
          @type,
          'pending',
          'pending'
        )
      `);

    res.json({
      appointment: result.recordset[0],
      paymentUrl: `/payment/mock-checkout/${result.recordset[0].id}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
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

    if (!appointment.recordset.length) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.recordset[0].consultation_type === "online") {
      meetingLink = `https://meet.jit.si/healcare-${appointmentId}-${Date.now()}`;
    }

    const result = await pool.request()
      .input("id", mssql.Int, appointmentId)
      .input("meetingLink", mssql.NVarChar, meetingLink)
      .query(`
        UPDATE Appointments
        SET payment_status='paid',
            status='confirmed',
            meeting_link = @meetingLink
        OUTPUT INSERTED.*
        WHERE id=@id
      `);

    res.json(result.recordset[0]);

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

    const result = await pool.request()
      .input("userId", mssql.Int, req.user.id)
      .query(`
        SELECT
          a.id,
          a.doctor_id,
          a.appointment_date,
          CONVERT(VARCHAR(5), a.appointment_start_time, 108) AS start_time,
          CONVERT(VARCHAR(5), a.appointment_end_time, 108) AS end_time,
          a.status,
          a.payment_status,
          a.meeting_link,
          a.consultation_type,
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
        ORDER BY a.appointment_date DESC, a.appointment_start_time ASC
      `);

    res.json(result.recordset);

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

    const result = await pool.request()
      .input("userId", mssql.Int, req.user.id)
      .query(`

        SELECT
          a.id,
          a.doctor_id,   -- ✅ REQUIRED FOR SLOT LOADING
          a.appointment_date,

          CONVERT(VARCHAR(5), a.appointment_start_time, 108)
          AS start_time,

          CONVERT(VARCHAR(5), a.appointment_end_time, 108)
          AS end_time,

          a.status,
          a.payment_status,
          a.meeting_link,
          a.consultation_type,

          d.specialization,

          u.name AS doctorName

        FROM Appointments a

        JOIN Patients p
        ON a.patient_id = p.id

        JOIN Doctors d
        ON a.doctor_id = d.id

        JOIN Users u
        ON d.user_id = u.id

        WHERE p.user_id = @userId

        ORDER BY a.appointment_date DESC

      `);

    res.json(result.recordset);

  }

  catch (err) {

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
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status required"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", mssql.Int, id)
      .input("status", mssql.NVarChar, status)
      .query(`
        UPDATE Appointments
        SET status=@status
        OUTPUT INSERTED.*
        WHERE id=@id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

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

    if (!date || !timeSlot) {
      return res.status(400).json({
        message: "date and timeSlot required"
      });
    }

    const pool = await poolPromise;

    let startRaw, endRaw;

    // ✅ Accept BOTH formats:
    // "10:00"
    // "10:00-11:00"

    if (timeSlot.includes("-")) {
      [startRaw, endRaw] = timeSlot.split("-");
    } else {
      startRaw = timeSlot;

      const [h, m] = startRaw.split(":").map(Number);

      endRaw =
        `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    const startTime =
      startRaw.trim().length === 5
        ? startRaw.trim() + ":00"
        : startRaw.trim();

    const endTime =
      endRaw.trim().length === 5
        ? endRaw.trim() + ":00"
        : endRaw.trim();

    const result = await pool.request()
      .input("id", mssql.Int, id)
      .input("date", mssql.Date, date)
      .input("startTime", mssql.Time, startTime)
      .input("endTime", mssql.Time, endTime)
      .query(`
        UPDATE Appointments
        SET appointment_date=@date,
            appointment_start_time=@startTime,
            appointment_end_time=@endTime,
            status='pending',
            payment_status='pending'
        OUTPUT INSERTED.*
        WHERE id=@id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    res.json(result.recordset[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Reschedule failed");
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {

    const { doctorId, date } = req.params;

    if (!doctorId || !date) {
      return res.status(400).json({
        message: "doctorId and date required"
      });
    }

    const pool = await poolPromise;

    const selectedDay = new Date(date).toLocaleDateString(
      "en-US",
      { weekday: "long" }
    );

    const slots = await pool.request()
      .input("doctorId", mssql.Int, doctorId)
      .input("day", mssql.NVarChar, selectedDay)
      .query(`
        SELECT
          id,
          available_day,
          start_time,
          end_time,
          max_patients
        FROM Slots
        WHERE doctor_id=@doctorId
        AND available_day=@day
        ORDER BY start_time
      `);

    res.json(slots.recordset);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Slots fetch error"
    });

  }
};