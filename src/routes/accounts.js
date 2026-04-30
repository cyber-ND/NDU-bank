const router = require('express').Router();
const { getBalance, nameEnquiry, getMyAccount } = require('../controllers/accountController');
const auth = require('../middleware/auth');

router.get('/me', auth, getMyAccount);
router.get('/balance', auth, getBalance);
router.get('/name-enquiry/:accountNumber', auth, nameEnquiry);

module.exports = router;