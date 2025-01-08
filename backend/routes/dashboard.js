const express = require('express');
const authMiddleware = require('../authMiddleware');
const upload = require('../middlewares/upload');
const dbQuery = require('../utils/dbQuery');
const router = express.Router();

// Middleware para autenticação de rotas admin
router.use('/admin', authMiddleware);

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

// Endpoints
router.get('/admin/clientes', async (req, res) => {
    try {
        const clientes = await dbQuery('SELECT user_id, nome, email, nivel FROM login');
        res.json(clientes);
    } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        res.status(500).json({ message: 'Erro ao buscar clientes' });
    }
});

// Usuários com nível 2
router.get('/admin/clientes/nivel2', async (req, res) => {
    try {
        const usuariosNivel2 = await dbQuery('SELECT user_id, nome FROM login WHERE nivel = 2');
        res.json(usuariosNivel2);
    } catch (err) {
        console.error('Erro ao buscar usuários nível 2:', err);
        res.status(500).json({ message: 'Erro ao buscar usuários nível 2' });
    }
});

router.put('/admin/clientes/:id', async (req, res) => {
    const clientId = req.params.id;
    const { nome, email, nivel } = req.body;

    try {
        const { query, values } = buildUpdateQuery('login', { nome, email, nivel }, 'WHERE user_id = ?');
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

// Eventos
router.get('/admin/eventos', async (req, res) => {
    try {
        const sql = `
            SELECT 
                eventos.id_evento, 
                eventos.nome, 
                eventos.data_inicio, 
                eventos.data_fim, 
                categorias.descricao AS categoria_nome,
                salas.nome_sala AS sala_nome,
                login.nome AS organizador_nome
            FROM eventos
            LEFT JOIN categorias ON eventos.id_categoria = categorias.id_categoria
            LEFT JOIN salas ON eventos.id_sala = salas.id_sala
            LEFT JOIN login ON eventos.id_organizador = login.user_id AND login.nivel = 3;
        `;

        const eventos = await dbQuery(sql);
        res.json(eventos);
    } catch (err) {
        console.error('Erro ao buscar eventos:', err);
        res.status(500).json({ message: 'Erro ao buscar eventos' });
    }
});  

router.put('/admin/eventos/:id', async (req, res) => {
    const eventId = req.params.id;
    const { nome, data_inicio, data_fim, id_categoria, id_sala, id_organizador } = req.body;

    try {
        const { query, values } = buildUpdateQuery(
            'eventos',
            { nome, data_inicio, data_fim, id_categoria, id_sala, id_organizador },
            'WHERE id_evento = ?'
        );
        const result = await dbQuery(query, [...values, eventId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Evento não encontrado' });
        }

        res.json({ message: 'Evento atualizado com sucesso' });
    } catch (err) {
        console.error('Erro ao atualizar evento:', err);
        res.status(500).json({ message: 'Erro ao atualizar evento' });
    }
});

// Palestrantes
router.get('/admin/palestrantes', async (req, res) => {
    try {
        const palestrantes = await dbQuery('SELECT * FROM palestrantes');
        res.json(palestrantes);
    } catch (err) {
        console.error('Erro ao buscar palestrantes:', err);
        res.status(500).json({ message: 'Erro ao buscar palestrantes' });
    }
});

router.put('/admin/palestrantes/:id', async (req, res) => {
    const palestranteId = req.params.id;
    const { biografia, user_id } = req.body;  
    const id_cliente = user_id;

    try {
        if (!biografia || id_cliente === undefined) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        const { query, values } = buildUpdateQuery('palestrantes', { id_cliente, biografia }, 'WHERE id_palestrante = ?');
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

// Categorias
router.get('/admin/categorias', async (req, res) => {
    try {
        const categorias = await dbQuery('SELECT id_categoria, descricao FROM categorias');
        res.json(categorias);
    } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        res.status(500).json({ message: 'Erro ao buscar categorias' });
    }
});

// Salas
router.get('/admin/salas', async (req, res) => {
    try {
        const salas = await dbQuery('SELECT id_sala, nome_sala, capacidade FROM salas');
        res.json(salas);
    } catch (err) {
        console.error('Erro ao buscar salas:', err);
        res.status(500).json({ message: 'Erro ao buscar salas' });
    }
});

router.put('/admin/salas/:id', async (req, res) => {
    const salaId = req.params.id;
    const { nome_sala, capacidade } = req.body;

    try {
        const { query, values } = buildUpdateQuery('salas', { nome_sala, capacidade }, 'WHERE id_sala = ?');
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

// Organizadores
router.get('/admin/organizadores', async (req, res) => {
    try {
        const organizadores = await dbQuery('SELECT id_organizador, user_id, departamento FROM organizadores');
        res.json(organizadores);
    } catch (err) {
        console.error('Erro ao buscar organizadores:', err);
        res.status(500).json({ message: 'Erro ao buscar organizadores' });
    }
});

router.get('/admin/clientesOrganizadores', async (req, res) => {
    try {
        const clientesOrganizadores = await dbQuery('SELECT user_id, nome FROM login WHERE nivel = 3');
        res.json(clientesOrganizadores);
    } catch (err) {
        console.error('Erro ao buscar clientes organizadores:', err);
        res.status(500).json({ message: 'Erro ao buscar clientes organizadores' });
    }
});

router.post('/admin/add-category', authMiddleware, (req, res) => {
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

router.post('/admin/add-sala', authMiddleware, (req, res) => {
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

router.put('/admin/organizadores/:id', async (req, res) => {
const organizadorId = req.params.id;
const { user_id, departamento } = req.body;

try {
    const userCheck = await dbQuery('SELECT nome FROM login WHERE user_id = ? AND nivel = 3', [user_id]);

    if (userCheck.length === 0) {
        return res.status(400).json({ message: 'Usuário inválido ou não é organizador' });
    }

    const { query, values } = buildUpdateQuery('organizadores', { user_id, departamento }, 'WHERE id_organizador = ?');
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

module.exports = router;
