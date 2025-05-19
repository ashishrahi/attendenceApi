const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const RoleWithPermissionController = require('../controllers/RoleWithPermissionController')
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
router.post('/create', RoleWithPermissionController.createRoleWithPermissions);
router.put('/update', RoleWithPermissionController.updateRoleWithPermissions);
router.get('/get', RoleWithPermissionController.getRoleWithPermissions);
router.get('/get/:id', RoleWithPermissionController.getRoleWithPermissions);
router.delete('/delete/:id', RoleWithPermissionController.deleteRoleWithPermissions);

module.exports = router;