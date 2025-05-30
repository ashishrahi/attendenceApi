const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const EmployeeTypeController = require('../controllers/EmployeeTypeController')
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
router.post('/create', EmployeeTypeController.createEmployeeType);
router.put('/update', EmployeeTypeController.updateEmployeeType);
router.get('/get', EmployeeTypeController.getEmployeeTypes);
router.delete('/delete/:id', EmployeeTypeController.deleteEmployeeType);

module.exports = router;