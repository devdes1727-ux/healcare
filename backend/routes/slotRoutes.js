const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const auth = require('../middleware/auth');

router.post('/', auth, slotController.createSlot);
router.get('/my', auth, slotController.getMySlots);
router.put('/:id', auth, slotController.updateSlot);
router.delete('/:id', auth, slotController.deleteSlot);
router.get('/doctor/:doctorId', slotController.getSlotsByDoctorId);

module.exports = router;
