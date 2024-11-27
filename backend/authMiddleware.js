const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido' });
  }

  const jwtToken = token.split(' ')[1]; // Formato "Bearer token"

  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // Log para verificar o conteúdo do token
    console.log('Token decodificado:', decoded);

    req.userId = decoded.id;
    req.userNivel = decoded.nivel;

    if (decoded.nivel !== 4) {
      return res.status(403).json({ message: 'Acesso negado, apenas administradores.' });
    }

    next();
  } catch (err) {
    console.error('Erro ao verificar o token:', err);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};
