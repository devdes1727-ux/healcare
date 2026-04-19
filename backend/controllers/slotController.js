const { mssql, poolPromise } = require('../config/db');


// CREATE SLOT
exports.createSlot = async (req, res) => {
    try {
        const { availableDays, startTime, endTime, maxPatients, doctorId } = req.body;
        // frontend should pass "availableDays" as an array, optionally passing doctorId if admin or use req.user.id
        
        let targetDoctorId = doctorId;
        const pool = await poolPromise;

        if (!targetDoctorId) {
            const doctorResult = await pool.request()
                .input('userId', mssql.Int, req.user.id)
                .query("SELECT id FROM Doctors WHERE user_id = @userId");
            if (!doctorResult.recordset.length) return res.status(404).json({ message: "Doctor profile not found" });
            targetDoctorId = doctorResult.recordset[0].id;
        }

        const sTime = startTime.length === 5 ? startTime + ':00' : startTime;
        const eTime = endTime.length === 5 ? endTime + ':00' : endTime;

        const insertedSlots = [];
        
        // Handle single availableDay if passed instead of availableDays Array (for backward compatibility)
        const daysToProcess = availableDays || (req.body.availableDay ? [req.body.availableDay] : []);

        if (daysToProcess.length === 0) return res.status(400).json({ message: "Day(s) required" });

        for (let day of daysToProcess) {
            const overlapCheck = await pool.request()
                .input('docId', mssql.Int, targetDoctorId)
                .input('day', mssql.NVarChar, day)
                .input('start', mssql.Time, sTime)
                .input('end', mssql.Time, eTime)
                .query(`
                    SELECT id FROM Slots 
                    WHERE doctor_id = @docId AND available_day = @day
                    AND ((start_time < @end AND end_time > @start))
                `);
                
            if(overlapCheck.recordset.length === 0) {
                 const resData = await pool.request()
                    .input('docId', mssql.Int, targetDoctorId)
                    .input('day', mssql.NVarChar, day)
                    .input('start', mssql.Time, sTime)
                    .input('end', mssql.Time, eTime)
                    .input('max', mssql.Int, maxPatients || 1)
                    .query(`INSERT INTO Slots (doctor_id, available_day, start_time, end_time, max_patients) 
                            OUTPUT INSERTED.* VALUES (@docId, @day, @start, @end, @max)`);
                 insertedSlots.push(resData.recordset[0]);
            }
        }
        
        // Return first one for simple forms or the whole list for advanced forms
        res.json(insertedSlots.length > 0 ? insertedSlots[0] : { message: "No slots added due to overlap" });
    } catch(err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

exports.updateSlot = async (req, res) => {
  try {
    const { availableDay, startTime, endTime, maxPatients } = req.body;
    const pool = await poolPromise;
    const sTime = startTime.length === 5 ? startTime + ':00' : startTime;
    const eTime = endTime.length === 5 ? endTime + ':00' : endTime;
    await pool.request()
        .input('id', mssql.Int, req.params.id)
        .input('day', mssql.NVarChar, availableDay)
        .input('start', mssql.Time, sTime)
        .input('end', mssql.Time, eTime)
        .input('max', mssql.Int, maxPatients || 1)
        .query(`UPDATE Slots SET available_day = @day, start_time = @start, end_time = @end, max_patients = @max WHERE id = @id`);
    res.json({ message: "Slot updated" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Update error");
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