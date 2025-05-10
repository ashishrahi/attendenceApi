const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');
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
router.get('/me', auth, personaController.getPersonaDetails);
router.post('/create', personaController.createPersona);
router.put('/update/:id', personaController.updatePersona);
router.get('/get', personaController.getPersonas);

module.exports = router;