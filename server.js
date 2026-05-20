require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./config/db');
const accountsRoutes = require('./routes/accounts.routes');

const app = express();

const port = process.env.PORT || 4000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4200';

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/accounts', accountsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'IPT 2026 Backend API is running' });
});

app.get('/health/db', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({
      message: 'Database connection successful',
      result: rows[0]
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
