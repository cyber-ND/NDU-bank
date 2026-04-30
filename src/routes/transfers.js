const router = require('express').Router();
const { initiateTransfer, getHistory, getTransactionStatus } = require('../controllers/transferController');
const auth = require('../middleware/auth');

router.post('/', auth, initiateTransfer);
router.get('/history', auth, getHistory);
router.get('/status/:transactionId', auth, getTransactionStatus);

module.exports = router;