const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');

router.post('/profile', auth, doctorController.createProfile);
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.put('/approve/:id', auth, doctorController.approveDoctor);

module.exports = router;
