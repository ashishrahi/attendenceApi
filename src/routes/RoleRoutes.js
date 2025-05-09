const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/RoleController');
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
router.post('/create', RoleController.createRole);
router.put('/update', RoleController.updateRole);
router.get('/get', RoleController.getRole);
router.delete('/delete/:id', RoleController.deleteRole);

module.exports = router;