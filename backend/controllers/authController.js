const { mssql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const pool = await poolPromise;

    // Check if user exists
    const checkUser = await pool.request()
      .input('email', mssql.NVarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.request()
      .input('name', mssql.NVarChar, name)
      .input('email', mssql.NVarChar, email)
      .input('password', mssql.NVarChar, hashedPassword)
      .input('role', mssql.NVarChar, role)
      .query('INSERT INTO Users (name, email, password, role) OUTPUT INSERTED.id, INSERTED.name, INSERTED.role VALUES (@name, @email, @password, @role)');

    const user = result.recordset[0];
    const userRole = user.role || user.Role;
    const userName = user.name || user.Name || name;

    const payload = { user: { id: user.id || user.ID, role: userRole } };
    jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: userRole, name: userName, email: user.email, profile_image: user.profile_image });
    });
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

    const userRole = user.role || user.Role;
    const userName = user.name || user.Name;

    const payload = { user: { id: user.id || user.ID, role: userRole } };
    jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: userRole, name: userName, email: user.email, profile_image: user.profile_image });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const pool = await poolPromise;
    let query = 'SELECT id, name, email, role, profile_image, created_at FROM Users WHERE id = @id';
    
    const result = await pool.request()
      .input('id', mssql.Int, req.user.id)
      .query(query);

    if (result.recordset.length === 0) return res.status(404).json({ message: 'User not found' });
    
    let user = result.recordset[0];
    
    if (user.role === 'patient') {
      const patientResult = await pool.request()
        .input('userId', mssql.Int, req.user.id)
        .query('SELECT * FROM Patients WHERE user_id = @userId');
      if (patientResult.recordset.length > 0) {
        user = { ...user, ...patientResult.recordset[0] };
      }
    } else if (user.role === 'doctor') {
      const doctorResult = await pool.request()
        .input('userId', mssql.Int, req.user.id)
        .query('SELECT * FROM Doctors WHERE user_id = @userId');
      if (doctorResult.recordset.length > 0) {
        user = { ...user, ...doctorResult.recordset[0] };
      }
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      phone, phoneNumber,
      age, 
      bloodGroup, blood_group,
      gender, 
      address, 
      category, 
      contactNumber, contact_number,
      receptionContact, reception_contact,
      showContactPreference, show_contact_preference,
      clinicName, clinic_name,
      clinicLocation, clinic_location,
      specialization, 
      experienceYears, experience_years,
      consultationFee, consultation_fee
    } = req.body;

    const finalPhone = phone || phoneNumber;
    const finalBloodGroup = bloodGroup || blood_group;
    const finalContact = contactNumber || contact_number;
    const finalReception = receptionContact || reception_contact;
    const finalClinicName = clinicName || clinic_name;
    const finalClinicLocation = clinicLocation || clinic_location;
    const finalExperience = experienceYears || experience_years;
    const finalFee = consultationFee || consultation_fee;

    let profileImage = null;
    if (req.file) {
      profileImage = 'http://localhost:5000/uploads/' + req.file.filename;
    }
    console.log('Update Profile - File:', req.file);
    console.log('Update Profile - Generated Path:', profileImage);
    
    const pool = await poolPromise;
    const transaction = new mssql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Update Users Table
      let userQuery = 'UPDATE Users SET name = @name';
      if (profileImage !== null) userQuery += ', profile_image = @profileImage';
      userQuery += ' OUTPUT INSERTED.* WHERE id = @id';

      const userRequest = transaction.request()
        .input('id', mssql.Int, req.user.id)
        .input('name', mssql.NVarChar, name || '');
      
      if (profileImage !== null) userRequest.input('profileImage', mssql.NVarChar, profileImage);
      const userResult = await userRequest.query(userQuery);
      const updatedUser = userResult.recordset[0];

      // 2. Update Role Specific Table
      if (req.user.role === 'patient') {
        const patientCheck = await transaction.request()
          .input('userId', mssql.Int, req.user.id)
          .query('SELECT * FROM Patients WHERE user_id = @userId');

        if (patientCheck.recordset.length > 0) {
          await transaction.request()
            .input('userId', mssql.Int, req.user.id)
            .input('phone', mssql.NVarChar, finalPhone || '')
            .input('gender', mssql.NVarChar, gender || '')
            .input('age', mssql.Int, parseInt(age) || null)
            .input('bloodGroup', mssql.NVarChar, finalBloodGroup || '')
            .input('address', mssql.NVarChar, address || '')
            .query(`UPDATE Patients SET phone_number = @phone, gender = @gender, age = @age, blood_group = @bloodGroup, address = @address WHERE user_id = @userId`);
        } else {
          await transaction.request()
            .input('userId', mssql.Int, req.user.id)
            .input('phone', mssql.NVarChar, finalPhone || '')
            .input('gender', mssql.NVarChar, gender || '')
            .input('age', mssql.Int, parseInt(age) || null)
            .input('bloodGroup', mssql.NVarChar, finalBloodGroup || '')
            .input('address', mssql.NVarChar, address || '')
            .query(`INSERT INTO Patients (user_id, phone_number, gender, age, blood_group, address) VALUES (@userId, @phone, @gender, @age, @bloodGroup, @address)`);
        }
      } else if (req.user.role === 'doctor') {
        const doctorCheck = await transaction.request()
          .input('userId', mssql.Int, req.user.id)
          .query('SELECT * FROM Doctors WHERE user_id = @userId');

        if (doctorCheck.recordset.length > 0) {
          await transaction.request()
            .input('userId', mssql.Int, req.user.id)
            .input('category', mssql.NVarChar, category || '')
            .input('contactNumber', mssql.NVarChar, finalContact || '')
            .input('receptionContact', mssql.NVarChar, finalReception || '')
            .input('showPreference', mssql.NVarChar, showContactPreference || show_contact_preference || 'Personal')
            .input('clinicName', mssql.NVarChar, finalClinicName || '')
            .input('clinicLocation', mssql.NVarChar, finalClinicLocation || '')
            .input('spec', mssql.NVarChar, specialization || '')
            .input('experience', mssql.Int, parseInt(finalExperience) || 0)
            .input('fee', mssql.Decimal(10, 2), parseFloat(finalFee) || 0)
            .query(`UPDATE Doctors SET 
                category = @category, 
                contact_number = @contactNumber, 
                reception_contact = @receptionContact, 
                show_contact_preference = @showPreference,
                clinic_name = @clinicName,
                clinic_location = @clinicLocation,
                specialization = @spec,
                experience_years = @experience,
                consultation_fee = @fee
                WHERE user_id = @userId`);
        } else {
          await transaction.request()
            .input('userId', mssql.Int, req.user.id)
            .input('category', mssql.NVarChar, category || '')
            .input('contactNumber', mssql.NVarChar, finalContact || '')
            .input('receptionContact', mssql.NVarChar, finalReception || '')
            .input('showPreference', mssql.NVarChar, showContactPreference || show_contact_preference || 'Personal')
            .input('clinicName', mssql.NVarChar, finalClinicName || '')
            .input('clinicLocation', mssql.NVarChar, finalClinicLocation || '')
            .input('spec', mssql.NVarChar, specialization || '')
            .input('experience', mssql.Int, parseInt(finalExperience) || 0)
            .input('fee', mssql.Decimal(10, 2), parseFloat(finalFee) || 0)
            .query(`INSERT INTO Doctors (user_id, category, contact_number, reception_contact, show_contact_preference, clinic_name, clinic_location, specialization, experience_years, consultation_fee) 
                    VALUES (@userId, @category, @contactNumber, @receptionContact, @showPreference, @clinicName, @clinicLocation, @spec, @experience, @fee)`);
        }
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
    res.status(500).send('Server Error updating profile');
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const pool = await poolPromise;
    
    const userResult = await pool.request()
      .input('email', mssql.NVarChar, email)
      .query('SELECT id FROM Users WHERE email = @email');
      
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userId = userResult.recordset[0].id;
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiry = new Date(Date.now() + 3600000); // 1 hour
    
    await pool.request()
      .input('id', mssql.Int, userId)
      .input('token', mssql.NVarChar, token)
      .input('expiry', mssql.DateTime, expiry)
      .query('UPDATE Users SET reset_token = @token, reset_token_expiry = @expiry WHERE id = @id');
      
    // In production, send email here. For demo, return token.
    res.json({ message: 'Reset token generated', token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const pool = await poolPromise;
    
    const userResult = await pool.request()
      .input('token', mssql.NVarChar, token)
      .query('SELECT id, reset_token_expiry FROM Users WHERE reset_token = @token');
      
    if (userResult.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    const user = userResult.recordset[0];
    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(400).json({ message: 'Token has expired' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await pool.request()
      .input('id', mssql.Int, user.id)
      .input('password', mssql.NVarChar, hashedPassword)
      .query('UPDATE Users SET password = @password, reset_token = NULL, reset_token_expiry = NULL WHERE id = @id');
      
    res.json({ message: 'Password reset successfully' });
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
      .query('SELECT password FROM Users WHERE id = @id');
      
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.recordset[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await pool.request()
      .input('id', mssql.Int, req.user.id)
      .input('password', mssql.NVarChar, hashedPassword)
      .query('UPDATE Users SET password = @password WHERE id = @id');
      
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
