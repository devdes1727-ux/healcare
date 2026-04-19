const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

// IMPORTANT: specific routes FIRST
router.post('/book', auth, appointmentController.bookAppointment);
router.post('/book-walkin', auth, appointmentController.bookWalkInAppointment);
router.post('/mock-payment', auth, appointmentController.mockPaymentSuccess);

router.get('/patient', auth, appointmentController.getPatientAppointments);
router.get('/doctor', auth, appointmentController.getDoctorAppointments);
router.put('/:id/status', auth, appointmentController.updateAppointmentStatus);
router.put('/reschedule/:id', auth, appointmentController.rescheduleAppointment);
router.get(
    "/available-slots/:doctorId/:date",
    auth,
    appointmentController.getAvailableSlots
);
module.exports = router;