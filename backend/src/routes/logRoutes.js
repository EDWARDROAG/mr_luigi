const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, isAdmin, logController.getLogs);
router.get('/stats', authMiddleware, isAdmin, logController.getLogStats);

module.exports = router;
