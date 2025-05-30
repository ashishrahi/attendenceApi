const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const UserController = require('../controllers/UserController')
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
router.post('/create', UserController.createUser);
router.put('/update/:id', UserController.updateUser);
router.get('/get/:id', UserController.getUser);
router.delete('/delete/:id', UserController.deleteUser);

module.exports = router;