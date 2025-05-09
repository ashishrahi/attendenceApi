const express = require('express');
const router = express.Router();
const BeatController = require('../controllers/BeatController');
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
router.post('/create', BeatController.createBeat);
router.put('/update', BeatController.updateBeat);
router.get('/get', BeatController.getBeat);
router.delete('/delete/:id', BeatController.deleteBeat);

module.exports = router;