const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const ShiftController = require('../controllers/ShiftController')
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
router.post('/create', ShiftController.createShift);
router.put('/update', ShiftController.updateShift);
router.get('/get', ShiftController.getShift);
router.delete('/delete/:id', ShiftController.deleteShift);

module.exports = router;