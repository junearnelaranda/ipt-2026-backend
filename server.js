require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const db = require('./config/db');
const swaggerSpec = require('./config/swagger');
const accountsRoutes = require('./routes/accounts.routes');

const app = express();

const port = process.env.PORT || 4000;
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:4200',
  'https://ipt-2026-frontend-3nao.onrender.com'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
  if (res.headersSent) {
    return next(err);
  }

  console.error('--- ERROR START ---');
  console.error(err.stack || err);
  console.error('--- ERROR END ---');

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
