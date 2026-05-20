const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const accountModel = require('../models/account.model');
const sendEmail = require('../helpers/send-email');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { title, firstName, lastName, email, password } = req.body;

    if (!title || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingAccount = await accountModel.findByEmail(email);

    if (existingAccount) {
      return res.status(400).json({ message: `Email ${email} is already registered` });
    }

    const isFirstAccount = (await accountModel.getAll()).length === 0;
    const role = isFirstAccount ? 'Admin' : 'User';

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(40).toString('hex');

    await accountModel.create({
      title,
      firstName,
      lastName,
      email,
      passwordHash,
      role,
      verificationToken
    });

    const verifyUrl = `${process.env.FRONTEND_URL || process.env.CORS_ORIGIN}/account/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: email,
      subject: 'Verify your email',
      html: `
        <p>Hello ${firstName},</p>
        <p>Please verify your email by clicking the link below:</p>
        <p><a href="${verifyUrl}">Verify Email</a></p>
      `
    });

    res.json({
      message: 'Registration successful, please check your email for verification instructions'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const account = await accountModel.findByVerificationToken(token);

    if (!account) {
      return res.status(400).json({ message: 'Verification failed' });
    }

    await accountModel.markVerified(account.id);

    res.json({ message: 'Verification successful, you can now login' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
