const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const LeaveTypeController = require('../controllers/LeaveTypeController')
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
router.post('/create', LeaveTypeController.createLeaveType);
router.put('/update/:id', LeaveTypeController.updateLeaveType);
router.get('/get', LeaveTypeController.getLeaveTypes);
router.delete('/delete/:id', LeaveTypeController.deleteLeaveType);

module.exports = router;