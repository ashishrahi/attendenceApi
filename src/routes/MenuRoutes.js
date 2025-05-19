const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const MenuController = require('../controllers/MenuController')
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
router.post('/create', MenuController.createMenu);
router.put('/update', MenuController.updateMenu);
router.get('/get', MenuController.getMenus);
router.get('/getchild', MenuController.getChildMenuMaster);
router.delete('/delete/:id', MenuController.deleteMenu);

module.exports = router;