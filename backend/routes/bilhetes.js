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
  