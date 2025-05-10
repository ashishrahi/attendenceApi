const express = require('express');
const router = express.Router();
const GenderController = require('../controllers/GenderController')
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
router.post('/create', GenderController.createGender);
router.put('/update', GenderController.updateGender);
router.get('/get', GenderController.getGender);
router.delete('/delete/:id', GenderController.deleteGender);


module.exports = router;