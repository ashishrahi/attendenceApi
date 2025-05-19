const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const USER_TYPEController = require('../controllers/User_TypeController')
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
router.post('/create', USER_TYPEController.createUserType);
router.put('/update', USER_TYPEController.updateUserType);
router.get('/get', USER_TYPEController.getUserTypes);
router.delete('/delete/:id', USER_TYPEController.deleteUserType);

module.exports = router;