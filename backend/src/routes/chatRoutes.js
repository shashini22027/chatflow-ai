const express = require('express');
const { getSessions, getSession, createSession, deleteSession, updateSession, searchChats } = require('../controllers/chatController');
const { streamChat } = require('../controllers/geminiController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/search', searchChats);
router.get('/', getSessions);
router.post('/', createSession);
router.post('/stream', streamChat);
router.get('/:id', getSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

module.exports = router;
