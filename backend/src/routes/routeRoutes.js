const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const auth = require('../middleware/auth');

router.post('/optimize', auth, routeController.optimizeRoute);
router.post('/', auth, routeController.createRoute);
router.get('/', auth, routeController.getRoutes);
router.get('/:id', auth, routeController.getRouteById);
router.put('/:id', auth, routeController.updateRoute);  // ✅ Make sure this exists
router.delete('/:id', auth, routeController.deleteRoute);
router.post('/:id/execute', auth, routeController.executeRoute);

module.exports = router;