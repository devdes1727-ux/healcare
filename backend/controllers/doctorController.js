const { mssql, poolPromise } = require('../config/db');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

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
      clinicLocation,
      medical_license_number,
      treatment_system,
      languages_spoken,
      age,
      phone_number
    } = req.body;
    const pool = await poolPromise;
    const nameResult = await pool.request().input('id', mssql.Int, req.user.id).query('SELECT name FROM Users WHERE id = @id');
    const doctorName = nameResult.recordset[0]?.name || 'doctor';
    const slug = doctorName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);

    let profileImage = null;
    if (req.file) {
      profileImage = 'http://localhost:5000/uploads/' + req.file.filename;
      // Also update Users table
      await pool.request()
        .input('id', mssql.Int, req.user.id)
        .input('img', mssql.NVarChar, profileImage)
        .query('UPDATE Users SET profile_image = @img WHERE id = @id');
    }

    const doctorCheck = await pool.request()
      .input('userId', mssql.Int, req.user.id)
      .query('SELECT id FROM Doctors WHERE user_id = @userId');

    let query;
    const request = pool.request()
      .input('userId', mssql.Int, req.user.id)
      .input('spec', mssql.NVarChar, specialization || 'General')
      .input('exp', mssql.Int, parseInt(experienceYears) || 0)
      .input('fee', mssql.Decimal(10, 2), parseFloat(consultationFee) || 0)
      .input('clinic', mssql.NVarChar, clinicName || '')
      .input('loc', mssql.NVarChar, clinicLocation || '')
      .input('license', mssql.NVarChar, medical_license_number || '')
      .input('sys', mssql.NVarChar, treatment_system || '')
      .input('lang', mssql.NVarChar, languages_spoken || '')
      .input('age', mssql.Int, parseInt(age) || null)
      .input('phone', mssql.NVarChar, phone_number || '')
      .input('slug', mssql.NVarChar, slug);

    if (doctorCheck.recordset.length > 0) {
      query = `
        UPDATE Doctors SET 
        specialization = @spec, experience_years = @exp, consultation_fee = @fee, 
        clinic_name = @clinic, clinic_location = @loc, medical_license_number = @license,
        treatment_system = @sys, languages_spoken = @lang, age = @age, contact_number = @phone
        OUTPUT INSERTED.* WHERE user_id = @userId
      `;
    } else {
      query = `
        INSERT INTO Doctors (user_id, specialization, experience_years, consultation_fee, clinic_name, clinic_location, medical_license_number, treatment_system, languages_spoken, age, contact_number, subscription_status, subscription_expiry, slug)
        OUTPUT INSERTED.* VALUES (@userId, @spec, @exp, @fee, @clinic, @loc, @license, @sys, @lang, @age, @phone, 'trial', DATEADD(day, 14, GETDATE()), @slug)
      `;
    }

    const result = await request.query(query);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getDoctorBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('slug', mssql.NVarChar, slug)
            .query(`
                SELECT d.id, u.name, d.specialization, d.experience_years, 
                       d.treatment_system, d.languages_spoken, d.clinic_location, 
                       u.profile_image, 
                       (SELECT ISNULL(AVG(CAST(rating as FLOAT)), 0) FROM Reviews WHERE doctor_id = d.id) as avg_rating,
                       (SELECT COUNT(*) FROM Reviews WHERE doctor_id = d.id) as total_reviews
                FROM Doctors d
                JOIN Users u ON d.user_id = u.id
                WHERE d.slug = @slug AND d.verification_status = 'approved'
            `);
        if (result.recordset.length === 0) return res.status(404).json({ message: "Doctor not found or not published" });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', mssql.Int, req.user.id)
            .query(`
                SELECT d.*, u.name, u.email, u.profile_image
                FROM Doctors d JOIN Users u ON d.user_id = u.id
                WHERE d.user_id = @userId
            `);
        if (result.recordset.length === 0) return res.status(404).json({ message: "Doctor profile not found" });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getDoctors = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT d.*, u.name, u.email, u.profile_image
      FROM Doctors d JOIN Users u ON d.user_id = u.id
      WHERE d.verification_status = 'approved'
      ORDER BY d.is_featured DESC, u.name ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', mssql.Int, req.params.id)
      .query(`
        SELECT d.*, u.name, u.email, u.profile_image
        FROM Doctors d JOIN Users u ON d.user_id = u.id
        WHERE d.id = @id
      `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.approveDoctor = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', mssql.Int, req.params.id)
      .query(`UPDATE Doctors SET verification_status = 'approved' OUTPUT INSERTED.* WHERE id = @id`);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

/* LEAVE MANAGEMENT */
exports.addLeaveDay = async (req, res) => {
    try {
        const { date, reason } = req.body;
        if (!date) return res.status(400).json({ message: "Date is required" });

        const pool = await poolPromise;
        const doctorResult = await pool.request()
            .input("userId", mssql.Int, req.user.id)
            .query("SELECT id FROM Doctors WHERE user_id = @userId");
        
        if (doctorResult.recordset.length === 0) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }
        
        const docId = doctorResult.recordset[0].id;
        const result = await pool.request()
            .input("docId", mssql.Int, docId)
            .input("date", mssql.Date, date)
            .input("reason", mssql.NVarChar, reason || 'Holiday')
            .query("INSERT INTO LeaveDays(doctor_id, leave_date, reason) OUTPUT INSERTED.* VALUES(@docId, @date, @reason)");
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Add Leave Error:', err);
        res.status(500).json({ message: "Failed to add leave day", error: err.message });
    }
};

exports.getLeaveDays = async (req, res) => {
    try {
        const pool = await poolPromise;
        const doctorResult = await pool.request()
            .input("userId", mssql.Int, req.user.id)
            .query("SELECT id FROM Doctors WHERE user_id = @userId");
        
        if (doctorResult.recordset.length === 0) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        const docId = doctorResult.recordset[0].id;
        const result = await pool.request()
            .input("docId", mssql.Int, docId)
            .query("SELECT * FROM LeaveDays WHERE doctor_id = @docId ORDER BY leave_date");
        res.json(result.recordset);
    } catch (err) {
        console.error('Fetch Leave Error:', err);
        res.status(500).json({ message: "Failed to fetch leaves", error: err.message });
    }
};

exports.deleteLeaveDay = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request().input("id", mssql.Int, id).query("DELETE FROM LeaveDays WHERE id = @id");
        res.json({ message: "Leave deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Leave delete error");
    }
};

exports.exportMyPatients = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', mssql.Int, req.user.id)
            .query(`
                SELECT 
                    u.name AS patientName, 
                    p.phone_number AS phone, 
                    p.gender, 
                    p.blood_group,
                    MAX(a.appointment_date) AS last_visit_date
                FROM Appointments a
                JOIN Patients p ON a.patient_id = p.id
                JOIN Users u ON p.user_id = u.id
                JOIN Doctors d ON a.doctor_id = d.id
                WHERE d.user_id = @userId
                GROUP BY u.name, p.phone_number, p.gender, p.blood_group
            `);
        
        const filePath = path.join(__dirname, '../uploads/my_patients.csv');
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                {id: 'patientName', title: 'NAME'},
                {id: 'phone', title: 'PHONE'},
                {id: 'gender', title: 'GENDER'},
                {id: 'blood_group', title: 'BLOOD GROUP'},
                {id: 'last_visit_date', title: 'LAST VISIT'}
            ]
        });

        await csvWriter.writeRecords(result.recordset);
        res.download(filePath);
    } catch (err) {
        console.error(err);
        res.status(500).send("Export failed");
    }
};

/* SUBSCRIPTIONS */
exports.upgradeSubscription = async (req, res) => {
    try {
        const { plan, amount } = req.body;
        const pool = await poolPromise;
        const doctorResult = await pool.request()
            .input("userId", mssql.Int, req.user.id)
            .query("SELECT id FROM Doctors WHERE user_id = @userId");
        const docId = doctorResult.recordset[0].id;

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        await pool.request()
            .input("docId", mssql.Int, docId)
            .input("plan", mssql.NVarChar, plan)
            .input("amount", mssql.Decimal(10, 2), amount)
            .input("expiry", mssql.DateTime, expiryDate)
            .query(`
                UPDATE Doctors SET subscription_status = @plan, subscription_expiry = @expiry WHERE id = @docId;
                INSERT INTO DoctorSubscriptions (doctor_id, plan_name, amount_paid, status, expiry_date)
                VALUES (@docId, @plan, @amount, 'active', @expiry)
            `);

        res.json({ message: "Subscription upgraded successfully", status: plan });
    } catch (err) {
        console.error(err);
        res.status(500).send("Upgrade failed");
    }
};

/* PROMOTIONS */
exports.promoteProfile = async (req, res) => {
    try {
        const { amount } = req.body;
        const pool = await poolPromise;
        const doctorResult = await pool.request()
            .input("userId", mssql.Int, req.user.id)
            .query("SELECT id FROM Doctors WHERE user_id = @userId");
        const docId = doctorResult.recordset[0].id;

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        await pool.request()
            .input("docId", mssql.Int, docId)
            .input("amount", mssql.Decimal(10, 2), amount)
            .input("expiry", mssql.DateTime, expiryDate)
            .query(`
                UPDATE Doctors SET is_featured = 1 WHERE id = @docId;
                IF EXISTS (SELECT 1 FROM FeaturedDoctorPromotions WHERE doctor_id = @docId)
                    UPDATE FeaturedDoctorPromotions SET expiry_date = @expiry, status = 'active', amount_paid = @amount WHERE doctor_id = @docId
                ELSE
                    INSERT INTO FeaturedDoctorPromotions (doctor_id, amount_paid, status, expiry_date)
                    VALUES (@docId, @amount, 'active', @expiry)
            `);

        res.json({ message: "Profile promoted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Promotion failed");
    }
};