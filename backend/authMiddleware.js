const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.error('Token não fornecido no cabeçalho');
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Erro ao verificar token:', err);
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }

    if (!decoded || !decoded.id || !decoded.nivel) {
      console.error('Token decodificado está incompleto:', decoded);
      return res.status(400).json({ message: 'Token inválido ou faltando informações' });
    }

    if (decoded.nivel !== 4) {
      console.error('Usuário não tem permissão para acessar essa rota. Nível:', decoded.nivel);
      return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente' });
    }

    req.user = {
      id: decoded.id,
      nivel: decoded.nivel,
    };

    next();
  });
};
