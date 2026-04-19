require('dotenv').config();
console.log('Backend Starting...');
const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
app.use(cors());

// Webhook needs raw body - must be before express.json()
app.use('/api/payments', paymentRoutes);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static('uploads'));

const PORT = 5000;

poolPromise.then(pool => {
    console.log('Database Connected Successfully');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
});
