const { mssql, poolPromise } = require('../config/db');

async function updateSchema() {
    try {
        const pool = await poolPromise;
        console.log('Updating schema...');

        // Add profile_image to Users
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'profile_image')
            BEGIN
                ALTER TABLE Users ADD profile_image NVARCHAR(MAX);
            END
        `);

        // Update Patients table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Patients') AND name = 'age')
            BEGIN
                ALTER TABLE Patients ADD age INT;
            END
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Patients') AND name = 'blood_group')
            BEGIN
                ALTER TABLE Patients ADD blood_group NVARCHAR(10);
            END
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Patients') AND name = 'address')
            BEGIN
                ALTER TABLE Patients ADD address NVARCHAR(MAX);
            END
        `);

        // Update Doctors table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Doctors') AND name = 'contact_number')
            BEGIN
                ALTER TABLE Doctors ADD contact_number NVARCHAR(20);
            END
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Doctors') AND name = 'reception_contact')
            BEGIN
                ALTER TABLE Doctors ADD reception_contact NVARCHAR(20);
            END
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Doctors') AND name = 'show_contact_preference')
            BEGIN
                ALTER TABLE Doctors ADD show_contact_preference NVARCHAR(20) DEFAULT 'Personal';
            END
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Doctors') AND name = 'category')
            BEGIN
                ALTER TABLE Doctors ADD category NVARCHAR(50);
            END
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Doctors') AND name = 'is_verified')
            BEGIN
                ALTER TABLE Doctors ADD is_verified BIT DEFAULT 0;
            END
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Doctors') AND name = 'total_consultations')
            BEGIN
                ALTER TABLE Doctors ADD total_consultations INT DEFAULT 0;
            END
        `);

        console.log('Schema updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
