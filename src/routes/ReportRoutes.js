const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const ReportController = require('../controllers/ReportController')
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
router.post('/daily', ReportController.handleDailyReport);
router.post('/montly', ReportController.handleMonthlyReport);
router.post('/punch', ReportController.handlePunchReport);


module.exports = router;