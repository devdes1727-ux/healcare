const { mssql, poolPromise } = require("../config/db");

exports.addReview = async (req, res) => {
    try {
        const { doctorId, rating, comment, type } = req.body;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("reviewerId", mssql.Int, req.user.id)
            .input("doctorId", mssql.Int, doctorId || null)
            .input("rating", mssql.Int, rating)
            .input("comment", mssql.NVarChar, comment)
            .input("type", mssql.NVarChar, type || 'doctor')
            .query(`
                INSERT INTO Reviews(reviewer_id, doctor_id, rating, comment, type)
                OUTPUT INSERTED.*
                VALUES(@reviewerId, @doctorId, @rating, @comment, @type)
            `);
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Review add error");
    }
};

exports.getDoctorReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input("docId", mssql.Int, id)
            .query(`
                SELECT r.*, u.name as reviewerName, u.profile_image as reviewerImage
                FROM Reviews r
                JOIN Users u ON r.reviewer_id = u.id
                WHERE r.doctor_id = @docId
                ORDER BY r.created_at DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Reviews fetch error");
    }
};

exports.getPlatformReviews = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT r.*, u.name as reviewerName, u.profile_image as reviewerImage
                FROM Reviews r
                JOIN Users u ON r.reviewer_id = u.id
                WHERE r.type = 'platform'
                ORDER BY r.created_at DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Platform reviews fetch error");
    }
};
