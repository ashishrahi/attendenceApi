const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const LeaveRequestController = require('../controllers/LeaveRequestController')
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
router.post('/create', LeaveRequestController.applyLeave);
router.put('/update/:id', LeaveRequestController.updateLeaveStatus);
router.get('/all', LeaveRequestController.getAllLeaveApplications);
router.get('/:id', LeaveRequestController.getLeaveApplicationById);
router.get('/getmyleave/:id', LeaveRequestController.getMyLeaveApplications);
router.get('/getpendingleave/:id', LeaveRequestController.getPendingLeaveApplications);
router.delete('/delete/:id', LeaveRequestController.deleteLeaveApplication);

module.exports = router;