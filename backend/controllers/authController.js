const { mssql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const pool = await poolPromise;
    const transaction = new mssql.Transaction(pool);

    await transaction.begin();

    try {
      const checkUser = await transaction.request()
        .input('email', mssql.NVarChar, email)
        .query('SELECT * FROM Users WHERE email = @email');

      if (checkUser.recordset.length > 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userInsert = await transaction.request()
        .input('name', mssql.NVarChar, name)
        .input('email', mssql.NVarChar, email)
        .input('password', mssql.NVarChar, hashedPassword)
        .input('role', mssql.NVarChar, role)
        .query(`
          INSERT INTO Users (name,email,password,role)
          OUTPUT INSERTED.id, INSERTED.name, INSERTED.role
          VALUES (@name,@email,@password,@role)
        `);

      const user = userInsert.recordset[0];
      const userId = user.id;

      if (role === 'patient') {
        await transaction.request()
          .input('userId', mssql.Int, userId)
          .query(`INSERT INTO Patients (user_id) VALUES (@userId)`);
      }

      if (role === 'doctor') {
        const slug =
          name.toLowerCase().replace(/[^a-z0-9]/g, '-') +
          '-' +
          Math.floor(1000 + Math.random() * 9000);

        await transaction.request()
          .input('userId', mssql.Int, userId)
          .input('slug', mssql.NVarChar, slug)
          .query(`
            INSERT INTO Doctors (user_id,specialization,consultation_fee,slug,subscription_status)
            VALUES (@userId,'',0,@slug,'trial')
          `);
      }

      await transaction.commit();

      const payload = { user: { id: userId, role } };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token, role, name, email });
        }
      );

    } catch (err) {
      await transaction.rollback();
      throw err;
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('email', mssql.NVarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');

    const user = result.recordset[0];
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        role: user.role,
        name: user.name,
        email: user.email,
        profile_image: user.profile_image
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', mssql.Int, req.user.id)
      .query('SELECT id,name,email,role,profile_image,created_at FROM Users WHERE id=@id');

    if (result.recordset.length === 0)
      return res.status(404).json({ message: 'User not found' });

    let user = result.recordset[0];

    if (user.role === 'patient') {
      const r = await pool.request()
        .input('userId', mssql.Int, req.user.id)
        .query('SELECT * FROM Patients WHERE user_id=@userId');

      if (r.recordset.length > 0) user = { ...user, ...r.recordset[0] };
    }

    if (user.role === 'doctor') {
      const r = await pool.request()
        .input('userId', mssql.Int, req.user.id)
        .query('SELECT * FROM Doctors WHERE user_id=@userId');

      if (r.recordset.length > 0) user = { ...user, ...r.recordset[0] };
    }

    res.json(user);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    let profileImage = null;
    if (req.file) {
      profileImage = 'http://localhost:5000/uploads/' + req.file.filename;
    }

    const pool = await poolPromise;
    const transaction = new mssql.Transaction(pool);
    await transaction.begin();

    try {
      const userRequest = transaction.request()
        .input('id', mssql.Int, req.user.id)
        .input('name', mssql.NVarChar, name);

      let query = 'UPDATE Users SET name=@name';

      if (profileImage) {
        query += ', profile_image=@profileImage';
        userRequest.input('profileImage', mssql.NVarChar, profileImage);
      }

      query += ' OUTPUT INSERTED.* WHERE id=@id';

      const userResult = await userRequest.query(query);
      const updatedUser = userResult.recordset[0];

      if (req.user.role === 'patient') {
        await transaction.request()
          .input('userId', mssql.Int, req.user.id)
          .query(`
            IF EXISTS (SELECT 1 FROM Patients WHERE user_id=@userId)
              UPDATE Patients SET phone_number=phone_number WHERE user_id=@userId
            ELSE
              INSERT INTO Patients (user_id) VALUES (@userId)
          `);
      }

      if (req.user.role === 'doctor') {
        const nameResult = await transaction.request()
          .input('id', mssql.Int, req.user.id)
          .query('SELECT name FROM Users WHERE id=@id');

        const doctorName = nameResult.recordset[0]?.name || 'doctor';

        const slugResult = await transaction.request()
          .input('id', mssql.Int, req.user.id)
          .query('SELECT slug FROM Doctors WHERE user_id=@id');

        let slug = slugResult.recordset[0]?.slug;

        if (!slug) {
          slug =
            doctorName.toLowerCase().replace(/[^a-z0-9]/g, '-') +
            '-' +
            Math.floor(1000 + Math.random() * 9000);
        }

        await transaction.request()
          .input('userId', mssql.Int, req.user.id)
          .input('slug', mssql.NVarChar, slug)
          .query(`
            IF EXISTS (SELECT 1 FROM Doctors WHERE user_id=@userId)
              UPDATE Doctors SET slug=@slug WHERE user_id=@userId
            ELSE
              INSERT INTO Doctors (user_id,slug) VALUES (@userId,@slug)
          `);
      }

      await transaction.commit();

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
        name: updatedUser.name
      });

    } catch (err) {
      await transaction.rollback();
      throw err;
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const pool = await poolPromise;

    const userResult = await pool.request()
      .input('email', mssql.NVarChar, email)
      .query('SELECT id FROM Users WHERE email=@email');

    if (userResult.recordset.length === 0)
      return res.status(404).json({ message: 'User not found' });

    const userId = userResult.recordset[0].id;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await pool.request()
      .input('id', mssql.Int, userId)
      .input('otp', mssql.NVarChar, otp)
      .input('expiry', mssql.DateTime, expiry)
      .query(`
        UPDATE Users
        SET reset_token=@otp,
            reset_token_expiry=@expiry
        WHERE id=@id
      `);

    const emailSent = await emailService.sendResetPasswordEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        message: 'Email sending failed. Check SMTP config.'
      });
    }

    return res.json({ message: 'OTP sent successfully' });

  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.sendResetOTP = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const pool = await poolPromise;

    const userResult = await pool.request()
      .input('phone', mssql.NVarChar, phone)
      .input('otp', mssql.NVarChar, otp)
      .query(`
        SELECT u.id,u.reset_token_expiry
        FROM Users u
        LEFT JOIN Patients p ON u.id=p.user_id
        LEFT JOIN Doctors d ON u.id=d.user_id
        WHERE (p.phone_number=@phone OR d.contact_number=@phone)
        AND u.reset_token=@otp
      `);

    if (userResult.recordset.length === 0)
      return res.status(400).json({ message: 'Invalid OTP' });

    const user = userResult.recordset[0];

    if (!user.reset_token_expiry || new Date(user.reset_token_expiry) < new Date())
      return res.status(400).json({ message: 'OTP expired' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input('id', mssql.Int, user.id)
      .input('password', mssql.NVarChar, hashedPassword)
      .query(`
        UPDATE Users
        SET password=@password, reset_token=NULL, reset_token_expiry=NULL
        WHERE id=@id
      `);

    res.json({ message: 'Password reset successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const pool = await poolPromise;

    const userResult = await pool.request()
      .input('otp', mssql.NVarChar, otp)
      .query('SELECT id,reset_token_expiry FROM Users WHERE reset_token=@otp');

    if (userResult.recordset.length === 0)
      return res.status(400).json({ message: 'Invalid OTP' });

    const user = userResult.recordset[0];

    if (!user.reset_token_expiry || new Date(user.reset_token_expiry) < new Date())
      return res.status(400).json({ message: 'OTP expired' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input('id', mssql.Int, user.id)
      .input('password', mssql.NVarChar, hashedPassword)
      .query(`
        UPDATE Users
        SET password=@password, reset_token=NULL, reset_token_expiry=NULL
        WHERE id=@id
      `);

    res.json({ message: 'Password reset successful' });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const pool = await poolPromise;

    const userResult = await pool.request()
      .input('id', mssql.Int, req.user.id)
      .query('SELECT password FROM Users WHERE id=@id');

    if (userResult.recordset.length === 0)
      return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, userResult.recordset[0].password);

    if (!isMatch)
      return res.status(400).json({ message: 'Incorrect current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input('id', mssql.Int, req.user.id)
      .input('password', mssql.NVarChar, hashedPassword)
      .query('UPDATE Users SET password=@password WHERE id=@id');

    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};