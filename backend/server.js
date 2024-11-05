const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

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
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados');
  }
});


app.get('/users', (req,res) => {
  const sql = "SELECT * FROM organizadores";
  db.query(sql, (err,data) => {
    if (err) return res.json(err);
    return res.json(data)
  })
})

app.get('/patrocinadores', (req,res) => {
  const sql = "SELECT * FROM patrocinadores";
  db.query(sql, (err,data) => {
    if (err) return res.json(err);
    return res.json(data)
  })
})

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }

  const sql = 'SELECT * FROM login WHERE email = ?';
  db.query(sql, [email], async (err, data) => {
    if (err) {
      console.error('Erro ao buscar o utilizador:', err);
      return res.status(500).json({ message: 'Erro no servidor.' });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    const user = data[0];

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Palavra-passe inválida.' });
      }

      return res.json({ 
        message: 'Login bem-sucedido!', 
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          nivel: user.nivel
        } 
      });

    } catch (error) {
      console.error('Erro ao comparar as senhas:', error);
      return res.status(500).json({ message: 'Erro no servidor.' });
    }
  });
});

app.post('/register', async (req, res) => {
  const { email, nome, password } = req.body;

  if (!email || !nome || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = 'INSERT INTO login (email, nome, password) VALUES (?, ?, ?)';

    db.query(sql, [email, nome, hashedPassword], (err, result) => {
      if (err) {
        console.error('Erro ao inserir no banco de dados:', err);
        return res.status(500).json({ message: 'Erro no servidor.' });
      }

      res.json({ message: 'Usuário cadastrado com sucesso!' });
    });
  } catch (err) {
    console.error('Erro ao encriptar a senha:', err);
    return res.status(500).json({ message: 'Erro ao processar a solicitação.' });
  }
});
app.listen(8081, () => {
  console.log('Servidor rodando na porta 8081');
});
const jwt = require('jsonwebtoken');

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }

  const sql = 'SELECT * FROM login WHERE email = ?';
  db.query(sql, [email], async (err, data) => {
    if (err) {
      console.error('Erro ao buscar o utilizador:', err);
      return res.status(500).json({ message: 'Erro no servidor.' });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const user = data[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Senha inválida.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        nivel: user.nivel
      },
      'yourSecretKey', 
      { expiresIn: '1h' }
    );

    return res.json({ 
      message: 'Login bem-sucedido!', 
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        nivel: user.nivel
      } 
    });
  });
});
