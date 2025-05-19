const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const LeaveApplicationController = require('../controllers/leaveApplicationController')
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
router.post('/create', LeaveApplicationController.applyLeave);
router.put('/update', LeaveApplicationController.updateLeaveStatus);
// router.get('/get', LeaveApplicationController.getArea);
// router.delete('/delete/:id', LeaveApplicationController.deleteArea);

module.exports = router;