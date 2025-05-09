const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const WardController = require('../controllers/WardController')
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
router.post('/create', WardController.createWard);
router.put('/update', WardController.updateWard);
router.get('/get', WardController.getWard);
router.delete('/delete/:id', WardController.deleteWard);

module.exports = router;