require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

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

app.get('/', (req, res) => {
  res.json({ message: 'IPT 2026 Backend API is running' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
