const express = require('express');
const { register, login, guestLogin, logout } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/guest', guestLogin);
router.post('/logout', logout);

module.exports = router;
