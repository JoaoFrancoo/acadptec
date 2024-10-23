const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // Para encriptar e comparar senhas

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexão com o banco de dados
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

// Rota de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Verifica se email e senha foram fornecidos
  if (!email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }

  // Busca o utilizador no banco de dados pelo email
  const sql = 'SELECT * FROM login WHERE email = ?';
  db.query(sql, [email], async (err, data) => {
    if (err) {
      console.error('Erro ao buscar o utilizador:', err);
      return res.status(500).json({ message: 'Erro no servidor.' });
    }

    // Verifica se o utilizador foi encontrado
    if (data.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const user = data[0];

    try {
      // Verifica se a senha fornecida é válida
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Senha inválida.' });
      }

      // Se as credenciais estiverem corretas, retorna uma mensagem de sucesso
      return res.json({ 
        message: 'Login bem-sucedido!', 
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          nivel: user.nivel  // Envia o nível do utilizador, útil para controle de acesso no frontend
        } 
      });

    } catch (error) {
      console.error('Erro ao comparar as senhas:', error);
      return res.status(500).json({ message: 'Erro no servidor.' });
    }
  });
});

// Iniciar o servidor
app.listen(8081, () => {
  console.log('Servidor rodando na porta 8081');
});
const jwt = require('jsonwebtoken');

// Rota de login com JWT
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

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        nivel: user.nivel
      },
      'yourSecretKey', // Defina uma chave secreta segura para assinar o token
      { expiresIn: '1h' } // O token expira em 1 hora
    );

    // Enviar o token ao frontend
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
