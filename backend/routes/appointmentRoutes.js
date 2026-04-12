const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

// IMPORTANT: specific routes FIRST
router.post('/book', auth, appointmentController.bookAppointment);
router.post('/mock-payment', auth, appointmentController.mockPaymentSuccess);

router.get('/patient', auth, appointmentController.getPatientAppointments);
router.get('/doctor', auth, appointmentController.getDoctorAppointments);

module.exports = router;