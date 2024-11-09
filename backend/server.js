const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path'); 

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: 'root',
  password: '',
  database: 'pi3bd'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao ligar ao banco de dados:', err);
  } else {
    console.log('Ligado ao banco de dados');
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');  
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage });

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT id, nome, email, foto FROM login WHERE id = ?';
  
  db.query(sql, [userId], (err, data) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar dados do utilizador' });
    if (data.length === 0) return res.status(404).json({ message: 'Utilizador não encontrado' });

    res.json(data[0]); 
  });
});

app.put('/user/:id', upload.single('foto'), async (req, res) => {
  const { nome, password } = req.body;
  const userId = req.params.id;
  const foto = req.file ? req.file.filename : null;
  
  const updateFields = [];
  const params = [];

  if (nome) {
    updateFields.push('nome = ?');
    params.push(nome);
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateFields.push('password = ?');
    params.push(hashedPassword);
  }
  if (foto) {
    updateFields.push('foto = ?');
    params.push(foto);
  }
  if (updateFields.length === 0) {
    return res.status(400).json({ message: 'Nenhuma informação para atualizar' });
  }

  const sql = `UPDATE login SET ${updateFields.join(', ')} WHERE id = ?`;
  params.push(userId);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Erro ao atualizar dados do utilizador:', err);
      return res.status(500).json({ message: 'Erro ao atualizar dados do utilizador' });
    }

    res.json({ message: 'Perfil atualizado com sucesso!' });
  });
});

app.listen(8081, () => {
  console.log('Servidor iniciado na porta 8081');
});
