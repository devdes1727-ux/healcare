const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleGuard = (role) => (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ message: "Access Denied" });
    next();
};

router.get('/stats', auth, roleGuard('admin'), adminController.getStats);
router.get('/doctors', auth, roleGuard('admin'), adminController.getAllDoctors);
router.get('/patients', auth, roleGuard('admin'), adminController.getAllPatients);
router.get('/export/patients', auth, adminController.exportPatients);
router.get('/export/appointments', auth, adminController.exportAppointments);

module.exports = router;
