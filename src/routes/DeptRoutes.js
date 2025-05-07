const express = require('express');
const router = express.Router();
const DeptController = require('../controllers/DeptController');
const auth = require('../middleware/auth');

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
// router.get('/me', auth, personaController.getPersonaDetails);
// router.post('/create', personaController.createPersona);
router.get('/get', DeptController.getDepartment);

module.exports = router;