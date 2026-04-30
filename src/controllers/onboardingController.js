const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const Account = require('../models/Account');
const nibss = require('../services/nibss');

async function register(req, res, next) {
  try {
    const { email, password, kycType, kycID, dob } = req.body;

    // 1. Basic field check
    if (!email || !password || !kycType || !kycID || !dob)
      return res.status(400).json({ message: 'All fields are required' });

    const type = kycType.toLowerCase();
    if (!['bvn', 'nin'].includes(type))
      return res.status(400).json({ message: 'kycType must be bvn or nin' });

    // 2. Check email not already registered
    const existingEmail = await Customer.findOne({ email });
    if (existingEmail)
      return res.status(409).json({ message: 'Email already registered' });

    // 3. Check kycID not already used
    const existingKyc = await Customer.findOne({ kycID });
    if (existingKyc)
      return res.status(409).json({ message: `${type.toUpperCase()} already linked to an account` });

    // 4. Validate KYC with NIBSS
    const kyc = await nibss.validateKyc(type, kycID);
    if (!kyc.valid)
      return res.status(400).json({ message: 'KYC validation failed. Check your BVN/NIN.' });

    // 5. Cross-check dob against what NIBSS has on record
    if (!kyc.dob.startsWith(dob))
      return res.status(400).json({ message: 'Date of birth does not match KYC records' });

    // 6. Hash password and save — use NIBSS-verified name, not user-supplied
    const hashedPassword = await bcrypt.hash(password, 12);
    await Customer.create({
      firstname: kyc.firstName,
      lastname: kyc.lastName,
      email,
      password: hashedPassword,
      kycType: type,
      kycID,
      dob,
      isVerified: true,
    });

    res.status(201).json({
      message: 'Registration successful. You can now log in and create your account.',
    });
  } catch (err) {
    next(err);
  }
}

async function createAccount(req, res, next) {
  try {
    const customer = req.customer;
    // console.log('Customer:', JSON.stringify(customer));

    if (customer.accountID)
      return res.status(409).json({ message: 'You already have an account' });

    // console.log('Calling NIBSS with:', customer.kycType, customer.kycID, customer.dob);
    
    const nibssAccount = await nibss.createNibssAccount(
      customer.kycType,
      customer.kycID,
      customer.dob
    );

    // console.log('NIBSS account:', JSON.stringify(nibssAccount));

    const account = await Account.create({
      customerId: customer._id,
      accountNumber: nibssAccount.accountNumber,
      bankCode: nibssAccount.bankCode,
      bankName: process.env.BANK_NAME,
      balance: 15000,
    });

    // console.log('Account saved to DB:', JSON.stringify(account));

    customer.accountID = account._id;
    await customer.save();

    // console.log('Customer updated with accountID');

    res.status(201).json({
      message: 'Account created successfully',
      accountNumber: account.accountNumber,
      bankCode: account.bankCode,
      bankName: account.bankName,
      balance: account.balance,
    });
  } catch (err) {
    // console.log('Create account error:', err.message);
    next(err);
  }
}

module.exports = { register, createAccount };