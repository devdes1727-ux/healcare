const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, './uploads/'); },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

router.post('/profile', auth, upload.single('profile_image'), doctorController.createProfile);
router.get('/', doctorController.getDoctors);
router.get('/public/:slug', doctorController.getDoctorBySlug);
router.get('/me', auth, doctorController.getMyProfile);
router.get('/export-patients', auth, doctorController.exportMyPatients);
router.get('/:id', doctorController.getDoctorById);
router.put('/approve/:id', auth, doctorController.approveDoctor);

// Leave Management
router.post('/leave', auth, doctorController.addLeaveDay);
router.get('/leave/me', auth, doctorController.getLeaveDays);
router.delete('/leave/:id', auth, doctorController.deleteLeaveDay);
router.post('/upgrade-subscription', auth, doctorController.upgradeSubscription);
router.post('/promote-profile', auth, doctorController.promoteProfile);

module.exports = router;
