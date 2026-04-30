const router = require('express').Router();
const { register, createAccount } = require('../controllers/onboardingController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/create-account', auth, createAccount);

module.exports = router;