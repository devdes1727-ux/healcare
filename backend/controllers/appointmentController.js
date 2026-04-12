const { mssql, poolPromise } = require("../config/db");

exports.bookAppointment = async (req, res) => {

  try {

    const { doctorId, date, timeSlot, type } = req.body;

    if (!doctorId || !date || !timeSlot || !type)

      return res.status(400).json({
        message: "doctorId, date, timeSlot, type required"
      });

    const pool = await poolPromise;

    const selectedDay = new Date(date)

      .toLocaleString("en-US", { weekday: "long" })

      .trim();

    const slotCheck = await pool.request()

      .input("doctorId", mssql.Int, doctorId)

      .input("day", mssql.NVarChar, selectedDay)

      .input("time", mssql.VarChar, timeSlot + ":00")

      .query(`
SELECT *
FROM Slots
WHERE doctor_id=@doctorId
AND LOWER(LTRIM(RTRIM(available_day)))
=
LOWER(LTRIM(RTRIM(@day)))
AND CAST(@time AS TIME)
>= start_time
AND CAST(@time AS TIME)
< end_time
`);

    if (!slotCheck.recordset.length)

      return res.status(400).json({
        message: "Selected slot not available"
      });

    const slot = slotCheck.recordset[0];

    const patientResult = await pool.request()

      .input("userId", mssql.Int, req.user.id)

      .query(`
SELECT id
FROM Patients
WHERE user_id=@userId
`);

    let patientId;

    if (patientResult.recordset.length)

      patientId = patientResult.recordset[0].id;

    else {

      const newPatient = await pool.request()

        .input("userId", mssql.Int, req.user.id)

        .query(`
INSERT INTO Patients(user_id)
OUTPUT INSERTED.id
VALUES(@userId)
`);

      patientId = newPatient.recordset[0].id;

    }

    const duplicateCheck = await pool.request()

      .input("doctorId", mssql.Int, doctorId)

      .input("patientId", mssql.Int, patientId)

      .input("date", mssql.Date, date)

      .input("time", mssql.VarChar, timeSlot + ":00")

      .query(`
SELECT id
FROM Appointments
WHERE doctor_id=@doctorId
AND patient_id=@patientId
AND appointment_date=@date
AND appointment_time=@time
`);

    if (duplicateCheck.recordset.length)

      return res.status(400).json({
        message: "You already booked this slot"
      });

    const bookingCount = await pool.request()

      .input("doctorId", mssql.Int, doctorId)

      .input("date", mssql.Date, date)

      .input("time", mssql.VarChar, timeSlot + ":00")

      .query(`
SELECT COUNT(*) total
FROM Appointments
WHERE doctor_id=@doctorId
AND appointment_date=@date
AND appointment_time=@time
`);

    if (bookingCount.recordset[0].total >= slot.max_patients)

      return res.status(400).json({
        message: "Slot full"
      });

    const result = await pool.request()

      .input("doctorId", mssql.Int, doctorId)

      .input("patientId", mssql.Int, patientId)

      .input("date", mssql.Date, date)

      .input("time", mssql.VarChar, timeSlot + ":00")

      .input("type", mssql.NVarChar, type)

      .query(`
INSERT INTO Appointments(
doctor_id,
patient_id,
appointment_date,
appointment_time,
consultation_type,
status,
payment_status
)
OUTPUT INSERTED.*
VALUES(
@doctorId,
@patientId,
@date,
@time,
@type,
'pending',
'pending'
)
`);

    res.json({
      appointment: result.recordset[0],
      paymentUrl: "/payment/mock-checkout/" + result.recordset[0].id
    });

  } catch (err) {

    console.error(err);
    res.status(500).send("Server Error");

  }

};


exports.mockPaymentSuccess = async (req, res) => {

  try {

    const { appointmentId } = req.body;

    const pool = await poolPromise;

    const appointment = await pool.request()

      .input("id", mssql.Int, appointmentId)

      .query(`
SELECT consultation_type
FROM Appointments
WHERE id=@id
`);

    if (!appointment.recordset.length)

      return res.status(404).json({
        message: "Appointment not found"
      });

    let meetingLink = null;

    if (
      appointment.recordset[0]
        .consultation_type === "online"
    ) {

      meetingLink =
        `https://meet.jit.si/healcare-${appointmentId}-${Date.now()}`;

    }

    const result = await pool.request()

      .input("id", mssql.Int, appointmentId)
      .input("meetingLink", mssql.NVarChar, meetingLink)

      .query(`
UPDATE Appointments
SET
payment_status='paid',
status='confirmed',
meeting_link=
CASE
WHEN @meetingLink IS NOT NULL
THEN @meetingLink
ELSE meeting_link
END
OUTPUT INSERTED.*
WHERE id=@id
`);

    res.json(result.recordset[0]);

  } catch (err) {

    console.error(err);
    res.status(500).send("Server Error");

  }

};


exports.getDoctorAppointments = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request()

      .input("userId", mssql.Int, req.user.id)

      .query(`
SELECT
a.id,
a.appointment_date,
CONVERT(VARCHAR(5),a.appointment_time,108) AS appointment_time,
a.status,
a.payment_status,
a.meeting_link,
a.consultation_type,
p.age,
p.gender,
p.phone_number,
u.name AS patientName
FROM Appointments a
JOIN Doctors d ON a.doctor_id=d.id
JOIN Patients p ON a.patient_id=p.id
JOIN Users u ON p.user_id=u.id
WHERE d.user_id=@userId
ORDER BY a.appointment_date DESC
`);

    res.json(result.recordset);

  } catch (err) {

    console.error(err);
    res.status(500).send("Server Error");

  }

};


exports.getPatientAppointments = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request()

      .input("userId", mssql.Int, req.user.id)

      .query(`
SELECT
a.id,
a.appointment_date,
CONVERT(VARCHAR(5),a.appointment_time,108) AS appointment_time,
a.status,
a.payment_status,
a.meeting_link,
a.consultation_type,
d.specialization,
u.name AS doctorName
FROM Appointments a
JOIN Patients p ON a.patient_id=p.id
JOIN Doctors d ON a.doctor_id=d.id
JOIN Users u ON d.user_id=u.id
WHERE p.user_id=@userId
ORDER BY a.appointment_date DESC
`);

    res.json(result.recordset);

  } catch (err) {

    console.error(err);
    res.status(500).send("Server Error");

  }

};


exports.updateAppointmentStatus = async (req, res) => {

  try {

    const id = req.params.id;

    const { status } = req.body;

    const allowedStatuses = [

      "confirmed",
      "rejected",
      "cancelled_by_doctor",
      "cancelled_by_patient",
      "completed"

    ];

    if (!allowedStatuses.includes(status))

      return res.status(400).json({
        message: "Invalid status"
      });

    const pool = await poolPromise;

    let meetingLink = null;

    if (status === "confirmed") {

      meetingLink =
        `https://meet.jit.si/healcare-${id}-${Date.now()}`;

    }

    const result = await pool.request()

      .input("id", mssql.Int, id)
      .input("status", mssql.NVarChar, status)
      .input("meetingLink", mssql.NVarChar, meetingLink)

      .query(`
UPDATE Appointments
SET
status=@status,
meeting_link=
CASE
WHEN @meetingLink IS NOT NULL
AND consultation_type='online'
THEN @meetingLink
ELSE meeting_link
END
OUTPUT INSERTED.*
WHERE id=@id
`);

    res.json(result.recordset[0]);

  } catch (err) {

    console.error(err);
    res.status(500).send("Server Error");

  }

};


exports.rescheduleAppointment = async (req, res) => {

  try {

    const id = req.params.id;

    const { date, time } = req.body;

    if (!date || !time)

      return res.status(400).json({
        message: "date & time required"
      });

    const pool = await poolPromise;

    const appointment = await pool.request()

      .input("id", mssql.Int, id)

      .query(`
SELECT doctor_id
FROM Appointments
WHERE id=@id
`);

    if (!appointment.recordset.length)

      return res.status(404).json({
        message: "Appointment not found"
      });

    const doctorId =
      appointment.recordset[0].doctor_id;

    const selectedDay = new Date(date)

      .toLocaleDateString(
        "en-US",
        { weekday: "long" }
      );

    const slotCheck = await pool.request()

      .input("doctorId", mssql.Int, doctorId)
      .input("day", mssql.NVarChar, selectedDay)
      .input("time", mssql.Time, time + ":00")

      .query(`
SELECT *
FROM Slots
WHERE doctor_id=@doctorId
AND available_day=@day
AND @time BETWEEN start_time AND end_time
`);

    if (!slotCheck.recordset.length)

      return res.status(400).json({
        message: "Slot unavailable"
      });

    const result = await pool.request()

      .input("id", mssql.Int, id)
      .input("date", mssql.Date, date)
      .input("time", mssql.Time, time + ":00")

      .query(`
UPDATE Appointments
SET
appointment_date=@date,
appointment_time=@time,
status='pending'
OUTPUT INSERTED.*
WHERE id=@id
`);

    res.json(result.recordset[0]);

  } catch (err) {

    console.error(err);
    res.status(500).send("Server Error");

  }

};