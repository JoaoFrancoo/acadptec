const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const e = require('express');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 8081;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  app.use((req, res, next) => { console.log(`${req.method} ${req.url}`); next(); });
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
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../backend/imagensEvento'));
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
  const { quantidade } = req.body;
  const id_cliente = req.id_cliente;

  if (!id_cliente) {
    return res.status(400).json({ error: 'ID do cliente não encontrado no token' });
  }

  if (quantidade <= 0) {
    return res.status(400).json({ error: 'Quantidade inválida' });
  }

  try {
    await dbQuery('START TRANSACTION');

    const updateResult = await dbQuery(
      `UPDATE salas s
       JOIN eventos e ON e.id_sala = s.id_sala
       SET s.capacidade = s.capacidade - ?
       WHERE e.id_evento = ? AND s.capacidade >= ?`,
      [quantidade, id_evento, quantidade]
    );

    if (updateResult.affectedRows === 0) {
      await dbQuery('ROLLBACK');
      return res.status(400).json({ error: 'Capacidade insuficiente' });
    }

    const existingInscricao = await dbQuery(
      `SELECT quantidade FROM inscricoes WHERE id_cliente = ? AND id_evento = ?`,
      [id_cliente, id_evento]
    );

    if (existingInscricao.length > 0) {
      await dbQuery(
        `UPDATE inscricoes SET quantidade = quantidade + ?, visivel = 1 WHERE id_cliente = ? AND id_evento = ?`,
        [quantidade, id_cliente, id_evento]
      );
    } else {
      await dbQuery(
        `INSERT INTO inscricoes (id_cliente, id_evento, visivel, quantidade) VALUES (?, ?, 1, ?)`,
        [id_cliente, id_evento, quantidade]
      );
    }

    await dbQuery('COMMIT');
    res.json({ mensagem: 'Bilhete comprado com sucesso' });

  } catch (error) {
    await dbQuery('ROLLBACK');
    console.error('Erro ao comprar bilhete:', error);
    res.status(500).json({ error: 'Erro ao comprar bilhete' });
  }
});
app.post('/retirar-bilhete/:id_evento', authMiddleware, async (req, res) => {
  const { id_evento } = req.params;
  const { quantidade } = req.body;
  const id_cliente = req.id_cliente;

  if (!id_cliente) {
    return res.status(400).json({ error: 'ID do cliente não encontrado no token' });
  }

  if (quantidade <= 0) {
    return res.status(400).json({ error: 'Quantidade inválida' });
  }

  try {
    await dbQuery('START TRANSACTION');

    const inscricaoResult = await dbQuery(
      `SELECT quantidade FROM inscricoes WHERE id_cliente = ? AND id_evento = ?`,
      [id_cliente, id_evento]
    );

    if (inscricaoResult.length === 0 || inscricaoResult[0].quantidade < quantidade) {
      await dbQuery('ROLLBACK');
      return res.status(400).json({ error: 'Quantidade de bilhetes insuficiente para desinscrever' });
    }

    await dbQuery(
      `UPDATE salas s
       JOIN eventos e ON e.id_sala = s.id_sala
       SET s.capacidade = s.capacidade + ?
       WHERE e.id_evento = ?`,
      [quantidade, id_evento]
    );

    if (inscricaoResult[0].quantidade === quantidade) {
      await dbQuery(
        `UPDATE inscricoes SET quantidade = 0, visivel = 0 WHERE id_cliente = ? AND id_evento = ?`,
        [id_cliente, id_evento]
      );
    } else {
      await dbQuery(
        `UPDATE inscricoes SET quantidade = quantidade - ?, visivel = 1 WHERE id_cliente = ? AND id_evento = ?`,
        [quantidade, id_cliente, id_evento]
      );
    }

    await dbQuery('COMMIT');
    res.json({ mensagem: 'Bilhete retirado com sucesso' });

  } catch (error) {
    await dbQuery('ROLLBACK');
    console.error('Erro ao retirar bilhete:', error);
    res.status(500).json({ error: 'Erro ao retirar bilhete' });
  }
});

app.post('/admin/eventos', authMiddleware, upload2.single('imagem'), async (req, res) => {
  const { nome, id_categoria, id_organizadores, id_sala, data_inicio, data_fim, user_id, breve_desc, descricao } = req.body;
  const imagem = req.file ? req.file.filename : null;

  // Adicionando logs para verificar o estado de req.file e imagem
  console.log('req.file:', req.file);
  console.log('Nome do arquivo da imagem:', imagem);

  if (!imagem) {
    return res.status(400).json({ message: 'Imagem é obrigatória' });
  }

  const sqlEvento = `
    INSERT INTO eventos (nome, data_inicio, data_fim, id_categoria, id_organizador, id_sala, foto, breve_desc, descricao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const eventoResult = await dbQuery(sqlEvento, [nome, data_inicio, data_fim, id_categoria, id_organizadores, id_sala, imagem, breve_desc, descricao]);
    const eventoId = eventoResult.insertId;

    console.log('Evento criado com ID:', eventoId); // Log para verificar se o evento foi criado

    const sqlEventosPalestrantes = `
      INSERT INTO eventopalestrante (id_evento, id_palestrante)
      VALUES (?, ?)
    `;

    // Verificação do array de user_id
    console.log('Array de user_id:', user_id);

    for (const palestranteUserId of user_id) {
      console.log('Inserindo palestrante com user_id:', palestranteUserId); 
      await dbQuery(sqlEventosPalestrantes, [eventoId, palestranteUserId])
        .catch(err => {
          console.error(`Erro ao inserir palestrante ${palestranteUserId}:`, err);
        });
    }

    res.json({ message: 'Evento criado com sucesso!' });
  } catch (err) {
    console.error('Erro ao criar evento:', err);
    res.status(500).json({ message: 'Erro ao criar evento' });
  }
});


// Endpoint para buscar categorias, organizadores e salas
app.get('/admin/opcoes',authMiddleware, async (req, res) => {
  try {
    console.log('Requisição recebida para /admin/opcoes');
    
    console.log('Antes da consulta do banco de dados');
    const categorias = await dbQuery('SELECT id_categoria, descricao FROM categorias');
    console.log('Categorias recuperadas:', categorias);
    

    const organizadores = await dbQuery('SELECT user_id, nome FROM login WHERE nivel = 3');
    console.log('Organizadores recuperados:', organizadores);

    const salas = await dbQuery('SELECT id_sala, nome_sala FROM salas');
    console.log('Salas recuperadas:', salas);

    // Verificação antes da consulta de palestrantes
    console.log('Iniciando a consulta para palestrantes...');
    const palestrantes = await dbQuery('SELECT user_id, nome FROM login WHERE nivel = 2');
    console.log('Palestrantes recuperados:', palestrantes);

    // Verificando se os palestrantes foram realmente recuperados
    if (!palestrantes.length) {
      console.log('Nenhum palestrante encontrado');
    }

    res.json({ categorias, organizadores, salas, palestrantes });
  } catch (err) {
    console.error('Erro ao buscar opções:', err);
    res.status(500).json({ message: 'Erro ao buscar opções' });
  }
});

// Endpoint para registrar usuário
app.post('/register', upload.single('foto'), async (req, res) => {
  const { email, nome, password } = req.body;
  const foto = req.file;

  if (!email || !nome || !password || !foto) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Encriptar a senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Inserir usuário no banco de dados
    const query = `
      INSERT INTO login (email, nome, password, foto) 
      VALUES (?, ?, ?, ?)
    `;

    // Salvar apenas o nome do arquivo no banco de dados
    const fotoNome = foto.filename; // Nome do arquivo salvo pelo multer

    db.query(query, [email, nome, hashedPassword, fotoNome], (err, result) => {
      if (err) {
        console.error('Erro ao inserir no banco:', err);
        return res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });
      }
      res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    });
  } catch (err) {
    console.error('Erro ao processar registro:', err);
    res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });
  }
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
    SELECT e.id_evento, e.nome AS nome_evento, i.quantidade
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
app.put('/user/me/update', authMiddleware, upload.single('foto'), async (req, res) => {
  const { user_id, nome, email, password, departamento, biografia } = req.body;
  const userId = user_id; 
  let foto = req.file ? req.file.filename : null;

  console.log("Dados recebidos no backend:", { nome, email, password, departamento, biografia, foto, userId });

  try {
    // Atualiza os campos do usuário na tabela login
    const updates = [];
    const values = [];

    if (nome) {
      updates.push('nome = ?');
      values.push(nome);
    }

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (foto) {
      updates.push('foto = ?');
      values.push(foto);
    }

    values.push(userId);

    if (updates.length > 0) {
      const sql = `UPDATE login SET ${updates.join(', ')} WHERE user_id = ?`;
      console.log("SQL Update:", sql, values);
      await dbQuery(sql, values);
    }

    // Atualiza o departamento se for organizador
    if (departamento !== undefined) {
      const organizador = await dbQuery('SELECT id_organizador FROM organizadores WHERE user_id = ?', [userId]);
      if (organizador.length > 0) {
        console.log("Organizador encontrado:", organizador[0]);
        await dbQuery('UPDATE organizadores SET departamento = ? WHERE id_organizador = ?', [departamento, organizador[0].id_organizador]);
      } else {
        console.log("Organizador não encontrado para userId:", userId);
      }
    }

    // Atualiza a biografia se for palestrante
    if (biografia !== undefined) {
      const id_cliente = userId; // Atribui userId a id_cliente para palestrantes
      const palestrante = await dbQuery('SELECT id_palestrante FROM palestrantes WHERE id_cliente = ?', [id_cliente]);
      if (palestrante.length > 0) {
        console.log("Palestrante encontrado:", palestrante[0]);
        await dbQuery('UPDATE palestrantes SET biografia = ? WHERE id_palestrante = ?', [biografia, palestrante[0].id_palestrante]);
      } else {
        console.log("Palestrante não encontrado para id_cliente:", id_cliente);
      }
    }

    res.json({ message: 'Perfil atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil.' });
  }
});

app.get('/eventos/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT e.id_evento, e.nome AS nome_evento, e.data_inicio, e.data_fim, 
           e.foto, e.breve_desc
    FROM eventos e
    WHERE e.visivel = 1
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [limit, offset], (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar eventos' });
    }

    // Construir a URL completa das fotos
    data.forEach(evento => {
      evento.foto = evento.foto ? `${req.protocol}://${req.get('host')}/uploadsEventos/${evento.foto}` : null;
    });

    // Total de eventos para paginação
    const sqlTotal = 'SELECT COUNT(*) AS total FROM eventos WHERE visivel = 1';
    db.query(sqlTotal, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao contar eventos' });
      }

      const total = result[0].total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        eventos: data,
        totalPages: totalPages,
        currentPage: page
      });
    });
  });
});


app.get('/eventos/:id', (req, res) => {
  const { id } = req.params;

  const sqlEvento = `
    SELECT e.id_evento, e.nome AS nome_evento, e.data_inicio, e.data_fim, 
           e.foto, e.descricao, c.descricao AS categoria, s.nome_sala, s.capacidade
    FROM eventos e
    JOIN salas s ON e.id_sala = s.id_sala
    JOIN categorias c ON e.id_categoria = c.id_categoria
    WHERE e.id_evento = ?;
  `;

  const sqlPalestrantes = `
    SELECT l.user_id, l.nome
    FROM login l
    INNER JOIN eventopalestrante ep ON l.user_id = ep.id_palestrante
    WHERE ep.id_evento = ?;
  `;

  db.query(sqlEvento, [id], (err, eventoData) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar evento' });
    if (eventoData.length === 0) return res.status(404).json({ error: 'Evento não encontrado' });

    const evento = eventoData[0];

    // Construir a URL completa da foto
    evento.foto = evento.foto ? `${req.protocol}://${req.get('host')}/uploadsEventos/${evento.foto}` : null;

    db.query(sqlPalestrantes, [id], (err, palestrantesData) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar palestrantes' });

      evento.palestrantes = palestrantesData;

      res.json(evento);
    });
  });
});

function formatPatrocinadoresLogos(patrocinadores, req) {
  return patrocinadores.map((p) => {
    p.logo = `${req.protocol}://${req.get('host')}/imagens/${p.logo}`;
    return p;
  });
}

app.get('/patrocinadores', async (req, res) => {
  const sql = `
    SELECT 
      id, 
      nome, 
      contacto,
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
      id, 
      nome, 
      contacto,
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
    patrocinador[0].logo = `${req.protocol}://${req.get('host')}/imagens/${patrocinador[0].logo}`;
    res.json(patrocinador[0]);
  } catch (error) {
    console.error('Erro ao buscar patrocinador:', error);
    res.status(500).json({ message: 'Erro ao buscar patrocinador' });
  }
});


// DASHBOARD SIDE - Rotas do Administrador
// Middleware de autenticação
  app.use(express.json());
  app.use('/admin', authMiddleware);

  // Função utilitária para construir queries dinamicamente
  const buildUpdateQuery = (table, data, whereClause) => {
    const keys = Object.keys(data).filter((key) => data[key] !== undefined);
    const values = keys.map((key) => data[key]);
    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    return {
      query: `UPDATE ${table} SET ${setClause} ${whereClause}`,
      values,
    };
  };

app.get('/admin/clientes', async (req, res) => {
  try {
    const clientes = await dbQuery('SELECT user_id, nome, email, nivel FROM login');
    res.json(clientes);
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    res.status(500).json({ message: 'Erro ao buscar clientes' });
  }
});

// **Usuários com nível 2**
app.get('/admin/clientes/nivel2', async (req, res) => {
  try {
    const usuariosNivel2 = await dbQuery('SELECT user_id, nome FROM login WHERE nivel = 2');
    res.json(usuariosNivel2);
  } catch (err) {
    console.error('Erro ao buscar usuários nível 2:', err);
    res.status(500).json({ message: 'Erro ao buscar usuários nível 2' });
  }
});


  app.put('/admin/clientes/:id', async (req, res) => {
    const clientId = req.params.id;
    const { nome, email, nivel } = req.body;

    try {
      const { query, values } = buildUpdateQuery(
        'login',
        { nome, email, nivel },
        'WHERE user_id = ?'
      );
      const result = await dbQuery(query, [...values, clientId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }

      res.json({ message: 'Cliente atualizado com sucesso' });
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      res.status(500).json({ message: 'Erro ao atualizar cliente' });
    }
  });

  // **Eventos**
  app.get('/admin/eventos', async (req, res) => {
    try {
      const sql = `
        SELECT 
          eventos.id_evento, 
          eventos.nome, 
          eventos.data_inicio, 
          eventos.data_fim, 
          eventos.visivel,
          categorias.descricao AS categoria_nome,
          salas.nome_sala AS sala_nome,
          login.nome AS organizador_nome
        FROM eventos
        LEFT JOIN categorias ON eventos.id_categoria = categorias.id_categoria
        LEFT JOIN salas ON eventos.id_sala = salas.id_sala
        LEFT JOIN login ON eventos.id_organizador = login.user_id AND login.nivel = 3;
      `;
  
      // Marque a função dbQuery como async
      const eventos = await dbQuery(sql);
      console.log(eventos);  // Exibe os dados dos eventos no console
      res.json(eventos);  // Retorna a lista de eventos com o campo 'visivel'
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      res.status(500).json({ message: 'Erro ao buscar eventos' });
    }
  });
  
  
  app.put('/admin/eventos/:id', async (req, res) => {
    const eventId = req.params.id;
    const { visivel, nome, data_inicio, data_fim, id_categoria, id_sala, id_organizador } = req.body;
  
    try {
      // Se apenas o campo `visivel` for enviado
      if (visivel !== undefined && !nome && !data_inicio && !data_fim && !id_categoria && !id_sala && !id_organizador) {
        const result = await dbQuery('UPDATE eventos SET visivel = ? WHERE id_evento = ?', [visivel, eventId]);
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Evento não encontrado' });
        }
  
        const message = visivel === 1 ? 'Evento ativado com sucesso' : 'Evento eliminado com sucesso';
        return res.json({ message });
      }
  
      // Atualização de outros campos do evento
      if (nome || data_inicio || data_fim || id_categoria || id_sala || id_organizador) {
        const { query, values } = buildUpdateQuery(
          'eventos',
          { nome, data_inicio, data_fim, id_categoria, id_sala, id_organizador },
          'WHERE id_evento = ?'
        );
  
        const result = await dbQuery(query, [...values, eventId]);
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Evento não encontrado' });
        }
  
        return res.json({ message: 'Evento atualizado com sucesso' });
      }
  
      // Caso nenhum dado válido seja enviado
      return res.status(400).json({ message: 'Nenhum campo válido foi fornecido para atualização' });
    } catch (err) {
      console.error('Erro ao atualizar evento:', err);
      res.status(500).json({ message: 'Erro ao atualizar evento' });
    }
  });
  

// Rota para obter palestrantes
app.get('/admin/palestrantes', async (req, res) => {
  try {
    const palestrantes = await dbQuery('SELECT * FROM palestrantes');
    res.json(palestrantes);
  } catch (err) {
    console.error('Erro ao buscar palestrantes:', err);
    res.status(500).json({ message: 'Erro ao buscar palestrantes' });
  }
});

app.put('/admin/palestrantes/:id', async (req, res) => {
  const palestranteId = req.params.id;
  const { biografia, user_id } = req.body;  // Agora usando id_cliente ao invés de user_id
  const id_cliente = user_id

  console.log('Dados recebidos:', req.body);

  try {
    // Verificar se biografia e id_cliente estão presentes
    if (!biografia || id_cliente === undefined) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Construir a query para atualizar os dados
    const { query, values } = buildUpdateQuery(
      'palestrantes',
      { id_cliente, biografia },  // Atualizado para id_cliente ao invés de id_cliente
      'WHERE id_palestrante = ?'
    );

    const result = await dbQuery(query, [...values, palestranteId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Palestrante não encontrado' });
    }

    res.json({ message: 'Palestrante atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar palestrante:', err);
    res.status(500).json({ message: 'Erro ao atualizar palestrante' });
  }
});


app.get('/admin/categorias', async (req, res) => {
  try {
    const categorias = await dbQuery('SELECT id_categoria, descricao, visivel FROM categorias');
    res.json(categorias);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err);
    res.status(500).json({ message: 'Erro ao buscar categorias' });
  }
});


app.put('/admin/categorias/:id', async (req, res) => {
  const { id } = req.params;
  const { descricao, visivel } = req.body;

  try {
    // Se apenas o campo `visivel` for enviado
    if (visivel !== undefined && !descricao) {
      const result = await dbQuery('UPDATE categorias SET visivel = ? WHERE id_categoria = ?', [visivel, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }

      const message = visivel === 1 ? 'Categoria ativada com sucesso' : 'Categoria desativada com sucesso';
      return res.json({ message });
    }

    // Atualização de outros campos da categoria
    if (descricao) {
      const result = await dbQuery('UPDATE categorias SET descricao = ? WHERE id_categoria = ?', [descricao, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }

      return res.json({ message: 'Categoria atualizada com sucesso' });
    }

    return res.status(400).json({ message: 'Nenhum campo válido foi fornecido para atualização' });
  } catch (err) {
    console.error('Erro ao atualizar categoria:', err);
    res.status(500).json({ message: 'Erro ao atualizar categoria' });
  }
});
  
app.get('/admin/salas', async (req, res) => {
  try {
    const salas = await dbQuery('SELECT id_sala, nome_sala, capacidade, visivel FROM salas');
    res.json(salas);
  } catch (err) {
    console.error('Erro ao buscar salas:', err);
    res.status(500).json({ message: 'Erro ao buscar salas' });
  }
});

  app.put('/admin/salas/:id', async (req, res) => {
    const salaId = req.params.id;
    const { nome_sala, capacidade, visivel } = req.body;
  
    try {
      // Se apenas o campo `visivel` for enviado
      if (visivel !== undefined && !nome_sala && !capacidade) {
        const result = await dbQuery('UPDATE salas SET visivel = ? WHERE id_sala = ?', [visivel, salaId]);
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Sala não encontrada' });
        }
  
        const message = visivel === 1 ? 'Sala ativada com sucesso' : 'Sala desativada com sucesso';
        return res.json({ message });
      }
  
      // Atualização de outros campos da sala
      const { query, values } = buildUpdateQuery(
        'salas',
        { nome_sala, capacidade },
        'WHERE id_sala = ?'
      );
      const result = await dbQuery(query, [...values, salaId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Sala não encontrada' });
      }
  
      res.json({ message: 'Sala atualizada com sucesso' });
    } catch (err) {
      console.error('Erro ao atualizar sala:', err);
      res.status(500).json({ message: 'Erro ao atualizar sala' });
    }
  });
  

 app.get('/admin/organizadores', async (req, res) => {
  try {
    const organizadores = await dbQuery('SELECT id_organizador, user_id, departamento FROM organizadores');
    console.log('Organizadores:', organizadores);
    res.json(organizadores);
  } catch (err) {
    console.error('Erro ao buscar organizadores:', err);
    res.status(500).json({ message: 'Erro ao buscar organizadores' });
  }
});

app.get('/admin/clientesOrganizadores', async (req, res) => {
  try {
    const clientesOrganizadores = await dbQuery('SELECT user_id, nome FROM login WHERE nivel = 3');
    res.json(clientesOrganizadores);
  } catch (err) {
    console.error('Erro ao buscar clientes organizadores:', err);
    res.status(500).json({ message: 'Erro ao buscar clientes organizadores' });
  }
});

app.post('/admin/add-category', authMiddleware, (req, res) => {
  const { descricao } = req.body;

    const query = 'INSERT INTO categorias (descricao) VALUES (?)';
    db.query(query, [descricao], (err, result) => {
      if (err) {
        console.error('Erro ao adicionar categoria:', err);
        return res.status(500).json({ success: false, message: 'Erro ao adicionar categoria.' });
      }
      res.status(200).json({ success: true, message: 'Categoria adicionada com sucesso!' });
    });
});
app.post('/admin/add-sala', authMiddleware, (req, res) => {
  const { nomeSala, capacidade } = req.body;

  const query = 'INSERT INTO salas (nome_sala, capacidade) VALUES (?, ?)';
  db.query(query, [nomeSala, capacidade], (err, result) => {
    if (err) {
      console.error('Erro ao adicionar sala:', err);
      return res.status(500).json({ success: false, message: 'Erro ao adicionar sala.' });
    }
    res.status(200).json({ success: true, message: 'Sala adicionada com sucesso!' });
  });
});

app.put('/admin/organizadores/:id', async (req, res) => {
  const organizadorId = req.params.id; // ID do organizador na tabela organizadores
  const { user_id, departamento } = req.body; // user_id refere-se à tabela login

  try {
    // Verificar se o user_id existe na tabela login e se é nível 3
    const userCheck = await dbQuery(
      'SELECT nome FROM login WHERE user_id = ? AND nivel = 3',
      [user_id]
    );

    if (userCheck.length === 0) {
      return res.status(400).json({ message: 'Usuário inválido ou não é organizador' });
    }

    // Atualizar a tabela organizadores
    const { query, values } = buildUpdateQuery(
      'organizadores',
      { user_id, departamento },
      'WHERE id_organizador = ?'
    );
    const result = await dbQuery(query, [...values, organizadorId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Organizador não encontrado' });
    }

    res.json({ message: 'Organizador atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar organizador:', err);
    res.status(500).json({ message: 'Erro ao atualizar organizador' });
  }
});




  // Iniciar o servidor
  app.listen(8081, () => {
    console.log('Servidor iniciado na porta 8081');
  });
