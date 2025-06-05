const express = require('express');
const router = express.Router();
// const DeptController = require('../controllers/DeptController');
const DashboardController = require('../controllers/DashboardController')

router.post('/get', DashboardController.Dasboarddata);
module.exports = router;