const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const nibss = require('../services/nibss');

async function initiateTransfer(req, res, next) {
  try {
    const { toAccount, amount, description } = req.body;
    const customer = req.customer;

    // 1. Validate input
    if (!toAccount || !amount)
      return res.status(400).json({ message: 'toAccount and amount are required' });

    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0)
      return res.status(400).json({ message: 'Amount must be a positive number' });

    // 2. Get sender account
    const senderAccount = await Account.findOne({ customerId: customer._id });
    if (!senderAccount)
      return res.status(404).json({ message: 'You do not have an account' });

    // 3. Prevent sending to yourself
    if (senderAccount.accountNumber === toAccount)
      return res.status(400).json({ message: 'You cannot transfer to your own account' });

    // 4. Name enquiry before transfer
    const recipient = await nibss.nameEnquiry(toAccount);

    // 5. Execute transfer on NIBSS
    const result = await nibss.transfer(
      senderAccount.accountNumber,
      toAccount,
      transferAmount
    );

    // console.log('transfer result:', JSON.stringify(result));

    const transactionId = result.reference || result.transactionId;

    // 6. Save debit transaction for sender
    await Transaction.create({
      customerId: customer._id,
      transactionId: transactionId,
      type: 'debit',
      amount: transferAmount,
      fromAccount: senderAccount.accountNumber,
      toAccount,
      fromBank: senderAccount.bankName,
      toBank: recipient.bankName || process.env.BANK_NAME,
      description: description || `Transfer to ${recipient.accountName}`,
      status: result.status,
      nibssResponse: result,
    });

    // 7. If recipient is also your customer (intra-bank), save their credit record
    const recipientAccount = await Account.findOne({ accountNumber: toAccount });
    if (recipientAccount) {
      await Transaction.create({
        customerId: recipientAccount.customerId,
        transactionId: transactionId + '_CR',
        type: 'credit',
        amount: transferAmount,
        fromAccount: senderAccount.accountNumber,
        toAccount,
        fromBank: senderAccount.bankName,
        toBank: recipient.bankName || process.env.BANK_NAME,
        description: description || `Transfer from ${customer.firstname} ${customer.lastname}`,
        status: result.status,
        nibssResponse: result,
      });

      // 8. Update local balance for intra-bank recipient
      recipientAccount.balance += transferAmount;
      await recipientAccount.save();
    }

    // 9. Update sender local balance
    senderAccount.balance -= transferAmount;
    await senderAccount.save();

    res.json({
      message: 'Transfer successful',
      transactionId: transactionId,
      amount: transferAmount,
      recipient: recipient.accountName,
      status: result.status,
    });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const transactions = await Transaction.find({ customerId: req.customer._id })
      .sort({ createdAt: -1 })  // newest first
      .select('-nibssResponse -__v'); // hide raw NIBSS data from client

    res.json({ transactions });
  } catch (err) {
    next(err);
  }
}

async function getTransactionStatus(req, res, next) {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      transactionId,
      customerId: req.customer._id,
    });

    if (!transaction)
      return res.status(404).json({ message: 'Transaction not found' });

    // only check NIBSS if transaction ID is a real NIBSS reference
    // locally generated ones start with TX + pure timestamp (no letters after TX)
    const isNibssReference = !transactionId.match(/^TX\d+$/);

    if (isNibssReference) {
      try {
        const nibssStatus = await nibss.getTransactionStatus(transactionId);
        if (nibssStatus && nibssStatus.status !== transaction.status) {
          transaction.status = nibssStatus.status;
          await transaction.save();
        }
      } catch (err) {
        // if NIBSS lookup fails, just return local status
        // console.log('NIBSS status check failed, using local status');
      }
    }

    res.json({
      transactionId: transaction.transactionId,
      type: transaction.type,
      amount: transaction.amount,
      fromAccount: transaction.fromAccount,
      toAccount: transaction.toAccount,
      description: transaction.description,
      status: transaction.status,
      createdAt: transaction.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { initiateTransfer, getHistory, getTransactionStatus };