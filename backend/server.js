const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, './imagens')));
app.use('/uploadsEventos', express.static(path.join(__dirname, './imagensEvento')));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao ligar à base de dados:', err);
  } else {
    console.log('Ligado à base de dados');
  }
});

const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, './imagensEvento'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload2 = multer({
  storage: storage2,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, './imagens'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  },
});

// Importa os roteadores
const loginRouter = require('./routes/login');
const dashboardRouter = require('./routes/dashboard');
const bilhetesRouter = require('./routes/bilhetes');

// Middleware para log de requisições
app.use((req, res, next) => { 
  console.log(`${req.method} ${req.url}`); 
  next(); 
});

// Utiliza os roteadores
app.use('/api', loginRouter);
app.use('/api', dashboardRouter);
app.use('/api', bilhetesRouter);

app.listen(8081, () => {
  console.log('Servidor iniciado na porta 8081');
});
