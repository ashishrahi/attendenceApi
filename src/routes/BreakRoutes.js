const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const BreakController = require('../controllers/BreakController')
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
router.post('/create', BreakController.createBreak);
router.put('/update', BreakController.updateBreak);
router.get('/get', BreakController.getBreaks);
router.delete('/delete/:id', BreakController.deleteBreak);

module.exports = router;