const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const DashboardController = require('../controllers/DashboardController')
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
router.post('/get', DashboardController.Dasboarddata);
module.exports = router;