const Account = require('../models/Account');
const nibss = require('../services/nibss');

async function getBalance(req, res, next) {
  try {
    const account = await Account.findOne({ customerId: req.customer._id });
    if (!account)
      return res.status(404).json({ message: 'No account found. Please create an account first.' });

    res.json({
      accountNumber: account.accountNumber,
      balance: account.balance,
      bankName: account.bankName,
    });
  } catch (err) {
    next(err);
  }
}

async function nameEnquiry(req, res, next) {
  try {
    const { accountNumber } = req.params;

    if (!accountNumber)
      return res.status(400).json({ message: 'Account number is required' });

    const result = await nibss.nameEnquiry(accountNumber);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getMyAccount(req, res, next) {
  try {
    const account = await Account.findOne({ customerId: req.customer._id });
    if (!account)
      return res.status(404).json({ message: 'No account found' });

    res.json({
      accountNumber: account.accountNumber,
      bankCode: account.bankCode,
      bankName: account.bankName,
      balance: account.balance,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBalance, nameEnquiry, getMyAccount };