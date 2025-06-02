const express = require('express');
const router = express.Router();
const HelpController = require('../controllers/HelpCreationController');

router.post('/create', HelpController.createHelpCreation);
router.put('/update', HelpController.updateHelpCreation);
router.get('/get', HelpController.getHelpCreation);
router.delete('/delete/:id', HelpController.deleteHelpCreation);

module.exports = router;