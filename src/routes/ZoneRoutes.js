const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const ZoneController = require('../controllers/ZoneController')
// const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/personas/me:
 *   get:
 *     tags: [Personas]
 *     summary: Get logged-in user's persona details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's persona details
 *       401:
 *         description: Unauthorized
 */
router.post('/create', ZoneController.createZone);
router.put('/update', ZoneController.updateZone);
router.get('/get', ZoneController.getZone);
router.delete('/delete/:id', ZoneController.deleteZone);

module.exports = router;