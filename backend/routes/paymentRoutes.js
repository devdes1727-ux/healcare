const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/create-subscription-session', auth, paymentController.createSubscriptionSession);
router.post('/create-promotion-session', auth, paymentController.createPromotionSession);
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

module.exports = router;
