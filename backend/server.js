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

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    req.id_cliente = decoded.id;
    next();
  });
};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, './imagens')));

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

// Promisificação do db.query
const dbQuery = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../backend/imagens'));
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

// Rotas da aplicação

// Listar usuários
app.get('/users', (req, res) => {
  const sql = "SELECT * FROM organizadores";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Comprar bilhete
app.post('/comprar-bilhete/:id_evento', authMiddleware, async (req, res) => {
  const { id_evento } = req.params;
  const id_cliente = req.id_cliente;

  if (!id_cliente) {
    return res.status(400).json({ error: 'ID do cliente não encontrado no token' });
  }

  try {
    await dbQuery('START TRANSACTION');

    const updateResult = await dbQuery(
      `UPDATE salas s
       JOIN eventos e ON e.id_sala = s.id_sala
       SET s.capacidade = s.capacidade - 1
       WHERE e.id_evento = ? AND s.capacidade > 0`,
      [id_evento]
    );

    if (updateResult.affectedRows === 0) {
      await dbQuery('ROLLBACK');
      return res.status(400).json({ error: 'Capacidade esgotada' });
    }

    await dbQuery(
      `INSERT INTO inscricoes (id_cliente, id_evento, visivel) VALUES (?, ?, 1)`,
      [id_cliente, id_evento]
    );

    await dbQuery('COMMIT');
    res.json({ mensagem: 'Bilhete comprado com sucesso' });

  } catch (error) {
    await dbQuery('ROLLBACK');
    console.error('Erro ao comprar bilhete:', error);
    res.status(500).json({ error: 'Erro ao comprar bilhete' });
  }
});

// Retirar bilhete
app.post('/retirar-bilhete/:id_evento', authMiddleware, async (req, res) => {
  const { id_evento } = req.params;
  const id_cliente = req.id_cliente;

  try {
    const updateResult = await dbQuery(
      `UPDATE inscricoes SET visivel = 0 
       WHERE id_cliente = ? AND id_evento = ? AND visivel = 1`,
      [id_cliente, id_evento]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ error: 'Bilhete não encontrado ou já retirado' });
    }

    await dbQuery(
      `UPDATE salas s
       JOIN eventos e ON e.id_sala = s.id_sala
       SET s.capacidade = s.capacidade + 1
       WHERE e.id_evento = ?`,
      [id_evento]
    );

    res.json({ mensagem: 'Bilhete retirado com sucesso' });
  } catch (error) {
    console.error('Erro ao retirar bilhete:', error);
    res.status(500).json({ error: 'Erro ao retirar bilhete' });
  }
});

// Listar eventos
app.get('/eventos', (req, res) => {
  const sql = `
    SELECT e.id_evento, e.nome AS nome_evento, e.data_inicio, e.data_fim, 
           c.descricao AS categoria, s.nome_sala, s.capacidade
    FROM eventos e
    JOIN salas s ON e.id_sala = s.id_sala
    JOIN categorias c ON e.id_categoria = c.id_categoria;
  `;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Registrar usuário
app.post('/register', upload.single('foto'), async (req, res) => {
  const { nome, email, password } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Por favor, envie uma foto.' });
  }

  const foto = req.file.filename;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO login (foto, email, nome, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [foto, email, nome, hashedPassword], (err) => {
    if (err) {
      console.error('Erro ao registrar o utilizador:', err);
      return res.status(500).json({ message: 'Erro ao registrar o utilizador' });
    }
    res.status(201).json({ message: 'Utilizador registrado com sucesso!' });
  });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM login WHERE email = ?';
  db.query(sql, [email], async (err, data) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar dados do utilizador' });
    if (data.length === 0) return res.status(404).json({ message: 'Utilizador não encontrado' });

    const user = data[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Palavra-passe incorreta' });

    const token = jwt.sign({ id: user.user_id, nivel: user.nivel }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Dados no token:', { id: user.user_id, nivel: user.nivel });


    res.json({ message: 'Login realizado com sucesso!', token });
  });
});

// Obter detalhes do usuário logado
app.get('/user/me/details', authMiddleware, (req, res) => {
  const userId = req.id_cliente;

  const sqlUser = 'SELECT user_id, foto, email, nome FROM login WHERE user_id = ?';
  const sqlInscricoes = `
    SELECT e.id_evento, e.nome AS nome_evento
    FROM inscricoes i
    JOIN eventos e ON i.id_evento = e.id_evento
    WHERE i.id_cliente = ? AND i.visivel = 1`;

  db.query(sqlUser, [userId], (err, userData) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar dados do utilizador' });
    if (userData.length === 0) return res.status(404).json({ message: 'Utilizador não encontrado' });

    const user = userData[0];
    user.foto = user.foto ? `${req.protocol}://${req.get('host')}/uploads/${user.foto}` : null;

    db.query(sqlInscricoes, [userId], (err, inscricoesData) => {
      if (err) return res.status(500).json({ message: 'Erro ao buscar inscrições' });

      res.json({
        user,
        inscricoes: inscricoesData,
      });
    });
  });
});

// Obter detalhes de um evento específico
app.get('/eventos/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT e.id_evento, e.nome AS nome_evento, e.data_inicio, e.data_fim, 
           c.descricao AS categoria, s.nome_sala, s.capacidade
    FROM eventos e
    JOIN salas s ON e.id_sala = s.id_sala
    JOIN categorias c ON e.id_categoria = c.id_categoria
    WHERE e.id_evento = ?;
  `;

  db.query(sql, [id], (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar evento' });
    if (data.length === 0) return res.status(404).json({ error: 'Evento não encontrado' });
    res.json(data[0]);
  });
});

// Função utilitária para formatar os logos com a URL completa
function formatPatrocinadoresLogos(patrocinadores, req) {
  return patrocinadores.map((p) => {
    p.logo = `${req.protocol}://${req.get('host')}/uploads/${p.logo}`;
    return p;
  });
}

// Listar todos os patrocinadores
app.get('/patrocinadores', async (req, res) => {
  const sql = `
    SELECT 
      id_patrocinador, 
      nome, 
      logo, 
      descricao 
    FROM patrocinadores
  `;

  try {
    const patrocinadores = await dbQuery(sql);
    const patrocinadoresComLogo = formatPatrocinadoresLogos(patrocinadores, req);
    res.json(patrocinadoresComLogo);
  } catch (error) {
    console.error('Erro ao buscar patrocinadores:', error);
    res.status(500).json({ message: 'Erro ao buscar patrocinadores' });
  }
});

// Obter detalhes de um patrocinador específico
app.get('/patrocinadores/:id', async (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      id_patrocinador, 
      nome, 
      logo, 
      descricao 
    FROM patrocinadores
    WHERE id_patrocinador = ?
  `;

  try {
    const patrocinador = await dbQuery(sql, [id]);

    if (patrocinador.length === 0) {
      return res.status(404).json({ message: 'Patrocinador não encontrado' });
    }

    // Atualizar a URL do logo do patrocinador específico
    patrocinador[0].logo = `${req.protocol}://${req.get('host')}/uploads/${patrocinador[0].logo}`;
    res.json(patrocinador[0]);
  } catch (error) {
    console.error('Erro ao buscar patrocinador:', error);
    res.status(500).json({ message: 'Erro ao buscar patrocinador' });
  }
});




// DASHBOARD SIDE

// Aplicação do middleware
app.use('/admin', authMiddleware);

// **Clientes**
app.get('/admin/clientes', (req, res) => {
  const sql = 'SELECT * FROM login';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar clientes' });
    res.json(data);
  });
});

app.put('/admin/clientes/:id', (req, res) => {
  const clientId = req.params.id;
  const { nome, email, nivel } = req.body;

  const sql = 'UPDATE login SET nome = ?, email = ?, nivel = ? WHERE user_id = ?';
  db.query(sql, [nome, email, nivel, clientId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erro ao atualizar cliente' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Cliente não encontrado' });
    res.json({ message: 'Cliente atualizado com sucesso' });
  });
});

app.put('/admin/block/:id', (req, res) => {
  const clientId = req.params.id;
  const sql = 'UPDATE login SET nivel = 0 WHERE user_id = ?';
  db.query(sql, [clientId], (err) => {
    if (err) return res.status(500).json({ message: 'Erro ao bloquear cliente' });
    res.json({ message: 'Cliente bloqueado com sucesso' });
  });
});

// **Eventos**
app.get('/admin/eventos', (req, res) => {
  const sql = `
    SELECT 
      eventos.id_evento, 
      eventos.nome, 
      eventos.data_inicio, 
      eventos.data_fim, 
      categorias.descricao AS categoria_nome,
      salas.nome_sala AS sala_nome,
      organizadores.nome AS organizador_nome
    FROM eventos
    LEFT JOIN categorias ON eventos.id_categoria = categorias.id_categoria
    LEFT JOIN salas ON eventos.id_sala = salas.id_sala
    LEFT JOIN organizadores ON eventos.id_organizador = organizadores.id_organizador
  `;
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar eventos' });
    res.json(data);
  });
});

app.put('/admin/eventos/:id', (req, res) => {
  const eventId = req.params.id;
  const { nome, data_inicio, data_fim } = req.body;

  const sql = 'UPDATE eventos SET nome = ?, data_inicio = ?, data_fim = ? WHERE id_evento = ?';
  db.query(sql, [nome, data_inicio, data_fim, eventId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erro ao atualizar evento' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Evento não encontrado' });
    res.json({ message: 'Evento atualizado com sucesso' });
  });
});

// **Palestrantes**
app.get('/admin/palestrantes', (req, res) => {
  const sql = 'SELECT * FROM palestrantes';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar palestrantes' });
    res.json(data);
  });
});

app.put('/admin/palestrantes/:id', (req, res) => {
  const palestranteId = req.params.id;
  const { nome, email } = req.body;

  const sql = 'UPDATE palestrantes SET nome = ?, email = ? WHERE id_palestrante = ?';
  db.query(sql, [nome, email, palestranteId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erro ao atualizar palestrante' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Palestrante não encontrado' });
    res.json({ message: 'Palestrante atualizado com sucesso' });
  });
});

app.put('/admin/palestrante/:id/status', (req, res) => {
  const palestranteId = req.params.id;
  const { status } = req.body;

  if (!['aprovado', 'recusado'].includes(status)) {
    return res.status(400).json({ message: 'Status inválido' });
  }

  const sql = 'UPDATE palestrantes SET status = ? WHERE id_palestrante = ?';
  db.query(sql, [status, palestranteId], (err) => {
    if (err) return res.status(500).json({ message: 'Erro ao atualizar status do palestrante' });
    res.json({ message: `Status do palestrante atualizado para ${status}` });
  });
});
app.get('/admin/categorias', (req, res) => {
  const sql = 'SELECT id_categoria, descricao FROM categorias';
  db.query(sql, (err, data) => {
    if (err) {
      console.error('Erro ao buscar categorias:', err);
      return res.status(500).json({ message: 'Erro ao buscar categorias' });
    }
    res.json(data);
  });
});

// Obter salas
app.get('/admin/salas', (req, res) => {
  const sql = 'SELECT id_sala, nome_sala, capacidade FROM salas';
  db.query(sql, (err, data) => {
    if (err) {
      console.error('Erro ao buscar salas:', err);
      return res.status(500).json({ message: 'Erro ao buscar salas' });
    }
    res.json(data);
  });
});

// Obter organizadores
app.get('/admin/organizadores', (req, res) => {
  const sql = 'SELECT id_organizador, nome FROM organizadores';
  db.query(sql, (err, data) => {
    if (err) {
      console.error('Erro ao buscar organizadores:', err);
      return res.status(500).json({ message: 'Erro ao buscar organizadores' });
    }
    res.json(data);
  });
});

// Iniciar o servidor
app.listen(8081, () => {
  console.log('Servidor iniciado na porta 8081');
});
