const User = require('../models/userModel');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }
  try {
    const user = await User.findOne({ email, password }); // Em produção, use hash de senha!
    if (user) {
      req.session.userId = user._id;
      res.send('Login realizado!');
    } else {
      res.status(401).send('Credenciais inválidas');
    }
  } catch (error) {
    res.status(500).send('Erro no servidor');
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.send('Logout realizado!');
};
