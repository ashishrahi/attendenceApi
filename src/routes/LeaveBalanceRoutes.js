const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const LeaveBalanceController = require('../controllers/LeaveBalanceController')
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
router.post('/create', LeaveBalanceController.createLeaveBalance);
router.put('/update/:id', LeaveBalanceController.updateLeaveBalance);
router.post('/get', LeaveBalanceController.getLeaveBalance);
router.post('/getsummary', LeaveBalanceController.getEmployeeLeaveDetails);
router.delete('/delete/:id', LeaveBalanceController.deleteLeaveBalance);

module.exports = router;