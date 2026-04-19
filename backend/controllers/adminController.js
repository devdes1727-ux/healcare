const { mssql, poolPromise } = require("../config/db");
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

exports.getStats = async (req, res) => {
    try {
        const pool = await poolPromise;

        const doctorStats = await pool.request().query(`
            SELECT 
                COUNT(*) as total, 
                SUM(CASE WHEN verification_status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN subscription_status = 'featured' THEN 1 ELSE 0 END) as featured
            FROM Doctors
        `);
        const patientStats = await pool.request().query("SELECT COUNT(*) as total FROM Patients");
        const apptStats = await pool.request().query(`
            SELECT 
                COUNT(*) as total, 
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status LIKE 'cancelled%' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN status IN ('confirmed', 'today') THEN 1 ELSE 0 END) as active
            FROM Appointments
        `);
        
        const earningStats = await pool.request().query(`
            SELECT 
                SUM(commission_amt) as totalBookingCommissions, 
                SUM(total_amount) as totalVolume 
            FROM Appointments 
            WHERE payment_status = 'paid'
        `);

        // Mock revenue for subscriptions/featured (in real app, we would sum the payments table)
        const subRevenue = await pool.request().query("SELECT COUNT(*) * 499 as total FROM Doctors WHERE subscription_status = 'monthly'");
        const featuredRevenue = await pool.request().query("SELECT COUNT(*) * 999 as total FROM Doctors WHERE subscription_status = 'featured'");

        res.json({
            doctors: doctorStats.recordset[0],
            patients: patientStats.recordset[0],
            appointments: apptStats.recordset[0],
            earnings: {
                ...earningStats.recordset[0],
                subscriptionRevenue: subRevenue.recordset[0].total || 0,
                featuredRevenue: featuredRevenue.recordset[0].total || 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Stats fetch error");
    }
};

exports.getAllDoctors = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT d.*, u.name, u.email, u.profile_image 
            FROM Doctors d 
            JOIN Users u ON d.user_id = u.id
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Admin doctors error");
    }
};

exports.getAllPatients = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT u.name, u.email, p.id as patient_id, p.phone_number as mobile, u.profile_image
            FROM Patients p
            JOIN Users u ON p.user_id = u.id
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Admin patients error");
    }
};

exports.exportPatients = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                COALESCE(u.name, 'Walk-in Patient') as name, 
                p.phone_number as mobile, 
                p.gender, 
                p.blood_group, 
                (SELECT MAX(appointment_date) FROM Appointments a WHERE a.patient_id = p.id) as last_visit_date
            FROM Patients p
            LEFT JOIN Users u ON p.user_id = u.id
        `);
        
        const filePath = path.join(__dirname, '../uploads/patients_export.csv');
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                {id: 'name', title: 'NAME'},
                {id: 'mobile', title: 'PHONE'},
                {id: 'gender', title: 'GENDER'},
                {id: 'blood_group', title: 'BLOOD GROUP'},
                {id: 'last_visit_date', title: 'LAST VISIT DATE'}
            ]
        });

        await csvWriter.writeRecords(result.recordset);
        res.download(filePath);
    } catch (err) {
        console.error(err);
        res.status(500).send("Export failed");
    }
};

exports.exportAppointments = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT a.id, u_doc.name as doctorName, u_pat.name as patientName, a.appointment_date, a.appointment_start_time, a.status, a.total_amount
            FROM Appointments a
            JOIN Doctors d ON a.doctor_id = d.id
            JOIN Users u_doc ON d.user_id = u_doc.id
            JOIN Patients p ON a.patient_id = p.id
            JOIN Users u_pat ON p.user_id = u_pat.id
        `);

        const filePath = path.join(__dirname, '../uploads/appointments_export.csv');
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                {id: 'id', title: 'ID'},
                {id: 'doctorName', title: 'DOCTOR'},
                {id: 'patientName', title: 'PATIENT'},
                {id: 'appointment_date', title: 'DATE'},
                {id: 'appointment_start_time', title: 'TIME'},
                {id: 'status', title: 'STATUS'},
                {id: 'total_amount', title: 'AMOUNT'}
            ]
        });

        await csvWriter.writeRecords(result.recordset);
        res.download(filePath);
    } catch (err) {
        console.error(err);
        res.status(500).send("Export failed");
    }
};
