const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const AreaController = require('../controllers/AreaController')
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
router.post('/create', AreaController.createArea);
router.put('/update', AreaController.updateArea);
router.get('/get', AreaController.getArea);
router.delete('/delete/:id', AreaController.deleteArea);

module.exports = router;