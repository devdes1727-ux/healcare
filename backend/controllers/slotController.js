const { mssql, poolPromise } = require('../config/db');


// CREATE SLOT
exports.createSlot = async (req, res) => {
  try {
    const { availableDay, startTime, endTime, maxPatients } = req.body;

    if (!availableDay || !startTime || !endTime) {
      return res.status(400).json({
        message: "Day, start time and end time required"
      });
    }

    const pool = await poolPromise;

    // Get doctor ID
    const doctorResult = await pool.request()
      .input('userId', mssql.Int, req.user.id)
      .query(`
        SELECT id
        FROM Doctors
        WHERE user_id = @userId
      `);

    const doctor = doctorResult.recordset[0];

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found"
      });
    }


    // Insert slot
    const result = await pool.request()
      .input('doctorId', mssql.Int, doctor.id)
      .input('day', mssql.NVarChar, availableDay)
      .input('start', mssql.Time, startTime + ':00')
      .input('end', mssql.Time, endTime + ':00')
      .input('max', mssql.Int, maxPatients || 1)
      .query(`
        INSERT INTO Slots
        (doctor_id, available_day, start_time, end_time, max_patients)

        OUTPUT
          INSERTED.id,
          INSERTED.doctor_id,
          INSERTED.available_day,
          CONVERT(VARCHAR(5), INSERTED.start_time,108) AS start_time,
          CONVERT(VARCHAR(5), INSERTED.end_time,108) AS end_time,
          INSERTED.max_patients

        VALUES
        (@doctorId,@day,@start,@end,@max)
      `);

    res.json(result.recordset[0]);

  } catch (err) {
    console.error("Create Slot Error:", err);
    res.status(500).send("Server Error");
  }
};



// GET MY SLOTS (Doctor dashboard)
exports.getMySlots = async (req, res) => {
  try {

    const pool = await poolPromise;

    const result = await pool.request()
      .input('userId', mssql.Int, req.user.id)
      .query(`
        SELECT
          s.id,
          s.doctor_id,
          s.available_day,

          CONVERT(VARCHAR(5), s.start_time,108) AS start_time,
          CONVERT(VARCHAR(5), s.end_time,108) AS end_time,

          s.max_patients

        FROM Slots s

        JOIN Doctors d
        ON s.doctor_id = d.id

        WHERE d.user_id = @userId

        ORDER BY
          CASE s.available_day
            WHEN 'Monday' THEN 1
            WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4
            WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6
            WHEN 'Sunday' THEN 7
          END,

          s.start_time
      `);

    res.json(result.recordset);

  } catch (err) {

    console.error(err);
    res.status(500).send("Server Error");

  }
};



// DELETE SLOT
exports.deleteSlot = async (req, res) => {

  try {

    const pool = await poolPromise;

    const doctorCheck = await pool.request()
      .input('userId', mssql.Int, req.user.id)
      .input('slotId', mssql.Int, req.params.id)
      .query(`
        SELECT s.id
        FROM Slots s

        JOIN Doctors d
        ON s.doctor_id = d.id

        WHERE d.user_id = @userId
        AND s.id = @slotId
      `);

    if (doctorCheck.recordset.length === 0) {

      return res.status(403).json({
        message: "Not authorized or slot not found"
      });

    }

    await pool.request()
      .input('slotId', mssql.Int, req.params.id)
      .query(`
        DELETE FROM Slots
        WHERE id = @slotId
      `);

    res.json({
      message: "Slot deleted"
    });

  } catch (err) {

    console.error(err);
    res.status(500).send("Server Error");

  }
};



// GET SLOTS BY DOCTOR ID (Patient booking screen)
exports.getSlotsByDoctorId = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request()
      .input('doctorId', mssql.Int, req.params.doctorId)
      .query(`
        SELECT
          id,
          doctor_id,
          available_day,

          CONVERT(VARCHAR(5), start_time,108) AS start_time,
          CONVERT(VARCHAR(5), end_time,108) AS end_time,

          max_patients

        FROM Slots

        WHERE doctor_id = @doctorId

        ORDER BY
          CASE available_day
            WHEN 'Monday' THEN 1
            WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4
            WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6
            WHEN 'Sunday' THEN 7
          END,

          start_time
      `);

    res.json(result.recordset);

  } catch (err) {

    console.error(err);
    res.status(500).send("Server Error");

  }
};