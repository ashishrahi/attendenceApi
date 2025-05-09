const express = require('express');
const router = express.Router();
const DeptController = require('../controllers/DeptController');
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
router.post('/create', DeptController.createDepartment);
router.put('/update', DeptController.updateDepartment);
router.get('/get', DeptController.getDepartment);
router.delete('/delete/:id', DeptController.deleteDepartment);

module.exports = router;