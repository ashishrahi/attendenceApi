const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const HoliDayController = require('../controllers/HoliDayController')
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
router.post('/create', HoliDayController.createHoliday);
router.put('/update', HoliDayController.updateHoliday);
router.get('/get', HoliDayController.getHolidays);
router.delete('/delete/:id', HoliDayController.deleteHoliday);

module.exports = router;