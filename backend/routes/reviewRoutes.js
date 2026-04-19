const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.post('/', auth, reviewController.addReview);
router.get('/doctor/:id', reviewController.getDoctorReviews);
router.get('/platform', reviewController.getPlatformReviews);

module.exports = router;
