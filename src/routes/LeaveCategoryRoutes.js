const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const LeaveCategoryController = require('../controllers/LeaveCategoryController')
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
router.post('/create', LeaveCategoryController.createLeaveCategory);
router.put('/update/:id', LeaveCategoryController.updateLeaveCategory);
router.get('/get', LeaveCategoryController.getLeaveCategory);
router.delete('/delete/:id', LeaveCategoryController.deleteLeaveCategory);

module.exports = router;