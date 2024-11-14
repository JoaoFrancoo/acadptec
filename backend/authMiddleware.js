const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Verificar se o token foi enviado nos cabeçalhos
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token de autenticação não fornecido' });
  }

  // Verificar o token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }

    // Extraindo o id_cliente do token decodificado
    req.id_cliente = decoded.id;  // Aqui estamos pegando o id que foi colocado no payload

    console.log('ID do cliente extraído do token:', req.id_cliente);  // Verificando se o id_cliente foi extraído corretamente

    // Passa o controle para o próximo middleware ou para a rota
    next();
  });
};

module.exports = authMiddleware;
