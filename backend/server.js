require('dotenv').config();

console.log('Backend Starting...');
if (!process.env.JWT_SECRET) console.warn('WARNING: JWT_SECRET is not set in .env! Using fallback_secret.');
else console.log('✓ JWT Secret Loaded');

const express = require('express');
const cors = require('cors');
const path = require('path');
const { poolPromise } = require('./config/db');
const { initCronJobs } = require('./services/cronService');

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const slotRoutes = require('./routes/slotRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
app.use(cors());

app.use('/api/payments', paymentRoutes);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

const PORT = 5000;

poolPromise.then(() => {
    console.log('Database Connected Successfully');
    initCronJobs();
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}).catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
});