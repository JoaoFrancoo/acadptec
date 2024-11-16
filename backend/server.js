const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path'); 
const app = express();
require('dotenv').config();
const authMiddleware = require('./authMiddleware');
const JWT_SECRET = process.env.JWT_SECRET;

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
    console.error('Erro ao ligar à base de dados:', err);
  } else {
    console.log('Ligado à base de dados');
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../frontend/src/imagens/');  
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage });

app.get('/users', (req,res) => {
  const sql = "SELECT * FROM organizadores";
  db.query(sql, (err,data) => {
    if (err) return res.json(err);
    return res.json(data)
  })
})

app.post('/comprar-bilhete/:id_evento', authMiddleware, async (req, res) => {
  const { id_evento } = req.params;
  const id_cliente = req.id_cliente;

  if (!id_cliente) {
    return res.status(400).json({ error: 'ID do cliente não encontrado no token' });
  }

  try {
    await db.query('BEGIN');
    console.log(`Iniciando a transação para o evento ${id_evento} e cliente ${id_cliente}`);

    const result = await db.query(
      `UPDATE salas s
       JOIN eventos e ON e.id_sala = s.id_sala
       SET s.capacidade = s.capacidade - 1
       WHERE e.id_evento = ? AND s.capacidade > 0`,
      [id_evento]
    );

    console.log(`Linhas afetadas pela atualização: ${result[0]?.affectedRows || 0}`);

    if (result[0]?.affectedRows === 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Capacidade esgotada' });
    }

    const newCapacityResult = await db.query(
      `SELECT s.capacidade FROM salas s
       JOIN eventos e ON e.id_sala = s.id_sala
       WHERE e.id_evento = ?`,
      [id_evento]
    );

    const newCapacity = newCapacityResult[0]?.capacidade;
    console.log(`Nova capacidade da sala: ${newCapacity}`);

    await db.query(
      `INSERT INTO inscricoes (id_cliente, id_evento) VALUES (?, ?)`,
      [id_cliente, id_evento]
    );

    await db.query('COMMIT');
  
    res.json({ mensagem: 'Bilhete comprado com sucesso', capacidade: newCapacity });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Erro ao comprar bilhete:', error); 
    res.status(500).json({ error: 'Erro ao comprar bilhete' });
  }
});


app.get('/eventos', (req, res) => {
    const sql = `
      SELECT e.id_evento, e.nome AS nome_evento, e.data_inicio, e.data_fim, 
             c.descricao AS categoria, s.nome_sala, s.capacidade
      FROM eventos e
      JOIN salas s ON e.id_sala = s.id_sala
      JOIN categorias c ON e.id_categoria = c.id_categoria;
    `;
    db.query(sql, (err,data) => {
      if (err) return res.json(err);
      return res.json(data)
    })
  })

app.post('/register', async (req, res) => {
  const { nome, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const sql = 'INSERT INTO login (nome, email, password) VALUES (?, ?, ?)';
  db.query(sql, [nome, email, hashedPassword], (err, result) => {
    if (err) {
      console.error('Erro ao registrar o utilizador:', err);
      return res.status(500).json({ message: 'Erro ao registrar o utilizador' });
    }
    res.status(201).json({ message: 'Utilizador registrado com sucesso!' });
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM login WHERE email = ?';
  db.query(sql, [email], async (err, data) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar dados do utilizador' });
    if (data.length === 0) return res.status(404).json({ message: 'Utilizador não encontrado' });

    const user = data[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Palavra-passe incorreta' });

    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login realizado com sucesso!', token });
  });
});

app.get('/user/:id', authMiddleware, (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT user_id, foto, email, nome FROM login WHERE user_id = ?';

  db.query(sql, [userId], (err, data) => {
    if (err) {
      console.error('Erro ao buscar dados do utilizador:', err);
      return res.status(500).json({ message: 'Erro ao buscar dados do utilizador' });
    }
    if (data.length === 0) {
      return res.status(404).json({ message: 'Utilizador não encontrado' });
    }

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

  const sql = `UPDATE login SET ${updateFields.join(', ')} WHERE user_id = ?`;
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
