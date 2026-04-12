const { mssql, poolPromise } = require('../config/db');


/*
========================================
CREATE / UPDATE DOCTOR PROFILE
========================================
*/

exports.createProfile = async (req, res) => {

  try {

    const {
      specialization,
      experienceYears,
      consultationFee,
      clinicName,
      clinicLocation
    } = req.body;

    const pool = await poolPromise;


    // check doctor exists

    const doctorCheck = await pool.request()

      .input('userId', mssql.Int, req.user.id)

      .query(`
        SELECT * 
        FROM Doctors 
        WHERE user_id = @userId
      `);


    let result;


    /*
    ==========================
    UPDATE PROFILE
    ==========================
    */

    if (doctorCheck.recordset.length > 0) {

      result = await pool.request()

        .input('userId', mssql.Int, req.user.id)

        .input('specialization', mssql.NVarChar, specialization || 'General')

        .input('experienceYears', mssql.Int, experienceYears || 0)

        .input('consultationFee', mssql.Decimal(10, 2), consultationFee || 0)

        .input('clinicName', mssql.NVarChar, clinicName || '')

        .input('clinicLocation', mssql.NVarChar, clinicLocation || '')

        .query(`
          UPDATE Doctors

          SET

          specialization = @specialization,

          experience_years = @experienceYears,

          consultation_fee = @consultationFee,

          clinic_name = @clinicName,

          clinic_location = @clinicLocation

          OUTPUT INSERTED.*

          WHERE user_id = @userId
        `);

    }


    /*
    ==========================
    INSERT PROFILE
    ==========================
    */

    else {

      result = await pool.request()

        .input('userId', mssql.Int, req.user.id)

        .input('specialization', mssql.NVarChar, specialization || 'General')

        .input('experienceYears', mssql.Int, experienceYears || 0)

        .input('consultationFee', mssql.Decimal(10, 2), consultationFee || 0)

        .input('clinicName', mssql.NVarChar, clinicName || '')

        .input('clinicLocation', mssql.NVarChar, clinicLocation || '')

        .query(`
          INSERT INTO Doctors

          (
            user_id,
            specialization,
            experience_years,
            consultation_fee,
            clinic_name,
            clinic_location
          )

          OUTPUT INSERTED.*

          VALUES

          (
            @userId,
            @specialization,
            @experienceYears,
            @consultationFee,
            @clinicName,
            @clinicLocation
          )
        `);

    }


    res.json(result.recordset[0]);

  }

  catch (err) {

    console.error(err);

    res.status(500).send('Server Error');

  }

};



/*
========================================
GET ALL DOCTORS
(LANDING PAGE SAFE VERSION)
========================================
*/

exports.getDoctors = async (req, res) => {

  try {

    const pool = await poolPromise;


    let query = `
      SELECT

      d.*,

      u.name,

      u.email,

      u.profile_image

      FROM Doctors d

      JOIN Users u

      ON d.user_id = u.id

      WHERE d.verification_status = 'approved'
    `;


    /*
    ==========================
    ADMIN CAN VIEW ALL
    ==========================
    */

    const token = req.header('Authorization');

    if (token) {

      const jwt = require('jsonwebtoken');

      try {

        const decoded = jwt.verify(

          token.replace('Bearer ', ''),

          process.env.JWT_SECRET || 'fallback_secret'
        );


        if (decoded.user.role === 'admin') {

          query = `
            SELECT

            d.*,

            u.name,

            u.email,

            u.profile_image

            FROM Doctors d

            JOIN Users u

            ON d.user_id = u.id
          `;

        }

      }

      catch (e) { }

    }


    const result = await pool.request().query(query);

    res.json(result.recordset);

  }

  catch (err) {

    console.error(err);

    res.status(500).send('Server Error');

  }

};



/*
========================================
GET SINGLE DOCTOR BY ID
========================================
*/

exports.getDoctorById = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request()

      .input('id', mssql.Int, req.params.id)

      .query(`
        SELECT

        d.*,

        u.name,

        u.email,

        u.profile_image

        FROM Doctors d

        JOIN Users u

        ON d.user_id = u.id

        WHERE d.id = @id
      `);


    if (result.recordset.length === 0)

      return res.status(404).json({

        message: 'Doctor not found'

      });


    res.json(result.recordset[0]);

  }

  catch (err) {

    console.error(err);

    res.status(500).send('Server Error');

  }

};



/*
========================================
ADMIN APPROVE DOCTOR
========================================
*/

exports.approveDoctor = async (req, res) => {

  try {

    if (req.user.role !== 'admin')

      return res.status(403).json({

        message: 'Access denied'

      });


    const pool = await poolPromise;

    const result = await pool.request()

      .input('id', mssql.Int, req.params.id)

      .query(`
        UPDATE Doctors

        SET verification_status = 'approved'

        OUTPUT INSERTED.*

        WHERE id = @id
      `);


    res.json(result.recordset[0]);

  }

  catch (err) {

    console.error(err);

    res.status(500).send('Server Error');

  }

};