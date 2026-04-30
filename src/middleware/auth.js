const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id);
    if (!customer)
      return res.status(401).json({ message: 'Customer not found' });

    req.customer = customer;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ message: 'Token expired, please log in again' });
    if (err.name === 'JsonWebTokenError')
      return res.status(401).json({ message: 'Invalid token' });
    next(err);
  }
};