const express = require('express');
const router = express.Router();
const { analyzeUrl, getHistory, getStats, deleteHistoryRecord } = require('../controllers/urlController');

router.post('/analyze', analyzeUrl);
router.get('/history', getHistory);
router.get('/stats', getStats);
router.delete('/history/:id', deleteHistoryRecord);

module.exports = router;
