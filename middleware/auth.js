const jwt = require('jsonwebtoken');
const accountModel = require('../models/account.model');

function authorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const account = await accountModel.findById(decoded.id);

        if (!account) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        if (roles.length && !roles.includes(account.role)) {
          return res.status(403).json({ message: 'Forbidden' });
        }

        req.account = account;
        next();
      } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }
  ];
}

module.exports = authorize;
