const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const UserPermissionController = require('../controllers/UserPermissionController')
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
router.post('/create', UserPermissionController.createUserPermission);
router.put('/update/:id', UserPermissionController.updateUserPermission);
router.get('/get/:id', UserPermissionController.getUserPermissions);
router.delete('/delete/:id', UserPermissionController.deleteUserPermission);

module.exports = router;