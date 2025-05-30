const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const EmployeeMapLeaveTypeController = require('../controllers/EmployeeMapLeaveTypeController')
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
router.post('/create', EmployeeMapLeaveTypeController.createLeaveMappings);
// router.put('/update', EmployeeMapLeaveTypeController.updateArea);
router.get('/get', EmployeeMapLeaveTypeController.getAllLeaveMappings);
router.get('/get/:id', EmployeeMapLeaveTypeController.getMappedLeaveTypes );
router.delete('/delete/:id', EmployeeMapLeaveTypeController.deleteAllLeaveMappings);

module.exports = router;