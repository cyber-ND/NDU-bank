const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const customer = await Customer.findOne({ email });
    if (!customer)
      return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: customer._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      customer: {
        id: customer._id,
        firstName: customer.firstname,
        lastName: customer.lastname,
        email: customer.email,
        isVerified: customer.isVerified,
        hasAccount: !!customer.accountID,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };