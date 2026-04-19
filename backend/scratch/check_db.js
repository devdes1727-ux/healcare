require('dotenv').config();
const { mssql, poolPromise } = require('../config/db');

async function checkCols() {
    try {
        const pool = await poolPromise;
        const res = await pool.request().query(`
            SELECT COLUMN_NAME, TABLE_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('Doctors', 'Patients', 'LeaveDays')
        `);
        console.log(JSON.stringify(res.recordset, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkCols();
