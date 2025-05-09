const express = require('express');
const router = express.Router();
const DesigController = require('../controllers/DesigController')
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
// router.get('/me', auth, personaController.getPersonaDetails);
// router.post('/create', personaController.createPersona);
router.post('/create', DesigController.createDesignation);
<<<<<<< HEAD
router.put('/update', DesigController.updateDesignation);
=======
>>>>>>> adidev0905
router.get('/get', DesigController.getDesignation);
// router.delete('/delete', DesigController.deleteDesignation);
router.delete('/delete/:id', DesigController.deleteDesignation);


module.exports = router;