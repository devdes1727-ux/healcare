const cron = require('node-cron');
const { mssql, poolPromise } = require('../config/db');
const emailService = require('../utils/EmailService');

exports.initCronJobs = () => {
    // 1. Mark No Shows - Every 10 Minutes
    cron.schedule('*/10 * * * *', async () => {
        const pool = await poolPromise;
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
    });

    // 2. Reminder 1 Hour Before - Runs every 5 Minutes
    cron.schedule('*/5 * * * *', async () => {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT a.id as apt_id, u.email, u.name, d.specialization 
            FROM Appointments a
            JOIN Patients p ON a.patient_id = p.id
            JOIN Users u ON p.user_id = u.id
            JOIN Doctors d ON a.doctor_id = d.id
            WHERE a.status = 'confirmed'
            AND DATEDIFF(minute, GETDATE(), CAST(a.appointment_date AS DATETIME) + CAST(a.appointment_start_time AS DATETIME)) BETWEEN 50 AND 60
        `);
        // Loop and Send 1 Hr Reminders via generic emailService
        result.recordset.forEach(apt => {
            if (emailService && emailService.sendReminderHtml) {
                emailService.sendReminderHtml(apt.email, apt.name, apt.specialization, '1 Hour');
            }
        });
    });

    // 3. Subscription Expiry - Runs daily at Midnight
    cron.schedule('0 0 * * *', async () => {
        const pool = await poolPromise;
        await pool.request().query(`
            UPDATE Doctors
            SET subscription_status = 'expired'
            WHERE subscription_expiry < GETDATE() AND subscription_status IN ('trial', 'monthly', 'featured')
        `);
    });
};
