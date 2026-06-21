const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const auth = require('../middleware/auth');

router.post('/', auth, deliveryController.createDelivery);
router.get('/', auth, deliveryController.getDeliveries);
router.get('/:id', auth, deliveryController.getDeliveryById);
router.put('/:id', auth, deliveryController.updateDelivery);
router.delete('/:id', auth, deliveryController.deleteDelivery);

module.exports = router;