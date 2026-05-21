const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const accountModel = require('../models/account.model');
const sendEmail = require('../helpers/send-email');
const authorize = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Account authentication and management
 */

/**
 * @swagger
 * /accounts/authenticate:
 *   post:
 *     summary: Authenticate account credentials and return a JWT token
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Authentication successful
 *       400:
 *         description: Email or password is incorrect
 */

/**
 * @swagger
 * /accounts/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, firstName, lastName, email, password]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Mr
 *               firstName:
 *                 type: string
 *                 example: Admin
 *               lastName:
 *                 type: string
 *                 example: User
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: admin123
 *               confirmPassword:
 *                 type: string
 *                 example: admin123
 *               acceptTerms:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Registration successful
 *       400:
 *         description: Invalid registration request
 */

/**
 * @swagger
 * /accounts/verify-email:
 *   post:
 *     summary: Verify a new account with a verification token
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification successful
 *       400:
 *         description: Verification failed
 */

/**
 * @swagger
 * /accounts/refresh-token:
 *   post:
 *     summary: Use a refresh token to generate a new JWT token
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: Refresh successful
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /accounts/revoke-token:
 *   post:
 *     summary: Revoke a refresh token
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token revoked
 *       400:
 *         description: Token is required
 */

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get all accounts Admin only
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accounts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /accounts/forgot-password:
 *   post:
 *     summary: Submit email address to reset the password on your account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent if account exists
 */

/**
 * @swagger
 * /accounts/validate-reset-token:
 *   post:
 *     summary: Validate the reset password token received in email
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid token
 */

/**
 * @swagger
 * /accounts/reset-password:
 *   post:
 *     summary: Reset the password for an account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password, confirmPassword]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 example: admin123
 *               confirmPassword:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token
 */

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new account Admin only
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, firstName, lastName, email, password, role]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Ms
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: User
 *               email:
 *                 type: string
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 example: user123
 *               confirmPassword:
 *                 type: string
 *                 example: user123
 *               role:
 *                 type: string
 *                 enum: [Admin, User]
 *                 example: User
 *     responses:
 *       200:
 *         description: Account created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Get a single account by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           oneOf:
 *             - type: integer
 *             - type: string
 *         example: me
 *     responses:
 *       200:
 *         description: Account found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Account not found
 *   put:
 *     summary: Update an account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           oneOf:
 *             - type: integer
 *             - type: string
 *         example: me
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Mr
 *               firstName:
 *                 type: string
 *                 example: Updated
 *               lastName:
 *                 type: string
 *                 example: User
 *               password:
 *                 type: string
 *                 example: newpass123
 *               confirmPassword:
 *                 type: string
 *                 example: newpass123
 *               role:
 *                 type: string
 *                 enum: [Admin, User]
 *                 example: User
 *     responses:
 *       200:
 *         description: Account updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   delete:
 *     summary: Delete an account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

const router = express.Router();

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

function generateJwtToken(account) {
  return require('jsonwebtoken').sign(
    { id: account.id, role: account.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function basicDetails(account) {
  return {
    id: account.id,
    title: account.title,
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    role: account.role,
    verified: account.verified,
    jwtToken: generateJwtToken(account)
  };
}

function getFrontendUrl() {
  return (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '').replace(/\/$/, '');
}

router.post('/register', async (req, res, next) => {
  try {
    const { title, firstName, lastName, email, password } = req.body;

    if (!title || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingAccount = await accountModel.findByEmail(email);

    if (existingAccount) {
      if (existingAccount.verified) {
        return res.status(400).json({ message: `Email ${email} is already registered` });
      }

      await accountModel.remove(existingAccount.id);
      console.log('Removed unverified account before retrying registration for:', email);
    }

    const isFirstAccount = (await accountModel.getAll()).length === 0;
    const role = isFirstAccount ? 'Admin' : 'User';

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(40).toString('hex');

    const accountId = await accountModel.create({
      title,
      firstName,
      lastName,
      email,
      passwordHash,
      role,
      verificationToken
    });

    const verifyUrl = `${getFrontendUrl()}/account/verify-email?token=${verificationToken}`;

    console.log('Sending verification email to:', email);

    try {
      await sendEmail({
        to: email,
        subject: 'Verify your email',
        html: `
          <p>Hello ${firstName},</p>
          <p>Please verify your email by clicking the link below:</p>
          <p><a href="${verifyUrl}">Verify Email</a></p>
        `
      });

      console.log('Verification email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send verification email to:', email);
      console.error(emailError.message);

      await accountModel.remove(accountId);
      console.log('Removed unverified account after failed verification email for:', email);

      return res.status(500).json({
        message: emailError.message || 'Failed to send verification email'
      });
    }

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

    res.json(basicDetails({
      ...tokenRecord,
      id: tokenRecord.accountId
    }));
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

router.get('/', authorize('Admin'), async (req, res, next) => {
  try {
    const accounts = await accountModel.getAll();
    res.json(accounts);
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    const account = await accountModel.findByEmail(email);

    if (account) {
      const resetToken = crypto.randomBytes(40).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await accountModel.saveResetToken(account.id, resetToken, resetTokenExpires);

      const resetUrl = `${getFrontendUrl()}/account/reset-password?token=${resetToken}`;

      await sendEmail({
        to: account.email,
        subject: 'Reset your password',
        html: `
          <p>Hello ${account.firstName},</p>
          <p>Please reset your password by clicking the link below:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>If the button does not work, copy and paste this URL into your browser:</p>
          <p>${resetUrl}</p>
        `
      });
    }

    return res.json({
      message: 'Please check your email for password reset instructions'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/validate-reset-token', async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token;
    const tokenInfo = token
      ? `${String(token).slice(0, 6)}... (${String(token).length} chars)`
      : 'missing';

    console.log('Validate reset token request received:', tokenInfo);

    if (!token) {
      console.log('Validate reset token result: token missing');
      return res.status(400).json({ message: 'Invalid token' });
    }

    const account = await accountModel.findByResetToken(token);

    console.log('Validate reset token result: account found =', Boolean(account));

    if (!account) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    return res.json({ message: 'Token is valid' });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const account = await accountModel.findByResetToken(token);

    if (!account) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await accountModel.update(account.id, {
      passwordHash,
      verified: new Date()
    });

    await accountModel.clearResetToken(account.id);

    return res.json({ message: 'Password reset successful, you can now login' });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const id = req.params.id === 'me' ? req.account.id : Number(req.params.id);

    if (req.account.id !== id && req.account.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const account = await accountModel.findById(id);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(basicDetails(account));
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('Admin'), async (req, res, next) => {
  try {
    const { title, firstName, lastName, email, password, role } = req.body;

    if (!title || !firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingAccount = await accountModel.findByEmail(email);

    if (existingAccount) {
      return res.status(400).json({ message: `Email ${email} is already registered` });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await accountModel.create({
      title,
      firstName,
      lastName,
      email,
      passwordHash,
      role,
      verificationToken: null
    });

    const createdAccount = await accountModel.findByEmail(email);
    await accountModel.markVerified(createdAccount.id);

    res.json({ message: 'Account created successfully' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const id = req.params.id === 'me' ? req.account.id : Number(req.params.id);

    if (req.account.id !== id && req.account.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const params = { ...req.body };

    delete params.confirmPassword;
    delete params.jwtToken;

    if (params.password) {
      params.passwordHash = await bcrypt.hash(params.password, 10);
    }

    delete params.password;

    if (req.account.role !== 'Admin') {
      delete params.role;
    }

    await accountModel.update(id, params);

    const updatedAccount = await accountModel.findById(id);

    res.json(basicDetails(updatedAccount));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize(), async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (req.account.id !== id && req.account.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await accountModel.remove(id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
