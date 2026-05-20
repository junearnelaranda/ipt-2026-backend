const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const accountModel = require('../models/account.model');
const sendEmail = require('../helpers/send-email');

const router = express.Router();

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
  return {
    id: account.accountId || account.id,
    title: account.title,
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    role: account.role,
    verified: account.verified
  };
}

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

router.post('/authenticate', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const account = await accountModel.findByEmail(email);

    if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
      return res.status(400).json({ message: 'Email or password is incorrect' });
    }

    if (!account.verified) {
      return res.status(400).json({ message: 'Account is not verified' });
    }

    const refreshToken = generateRefreshToken();

    await accountModel.updateRefreshToken(account.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAMESITE || 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json(basicDetails(account));
  } catch (error) {
    next(error);
  }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const oldToken = req.cookies.refreshToken;

    if (!oldToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tokenRecord = await accountModel.findRefreshToken(oldToken);

    if (!tokenRecord || tokenRecord.revoked || new Date(tokenRecord.expires) < new Date()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newRefreshToken = generateRefreshToken();

    await accountModel.revokeRefreshToken(oldToken, newRefreshToken);
    await accountModel.updateRefreshToken(tokenRecord.accountId, newRefreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAMESITE || 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json(basicDetails(tokenRecord));
  } catch (error) {
    next(error);
  }
});

router.post('/revoke-token', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.token;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    await accountModel.revokeRefreshToken(token);

    res.clearCookie('refreshToken');

    res.json({ message: 'Token revoked' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
