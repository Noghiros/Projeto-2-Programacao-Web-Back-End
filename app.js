const http = require('http');
const fs = require('fs');
const url = require('url');
const groupRoutes = require('./routes/groupRoute');
const userRoutes = require('./routes/userRoute');
const chatRoutes = require('./routes/chatRoute');
const mongoose = require('mongoose');
const errorLogger = require('./middlewares/errorLogger');

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/whatsapp2', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log(" Conectado ao MongoDB!");
}).catch((err) => {
  console.error(" Erro na conexão com MongoDB:", err);
  console.log(" Certifique-se de que o MongoDB está rodando em localhost:27017");
});

const PORT = 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  console.log(`📍 ${req.method} ${parsedUrl.pathname}`);

  // Servir arquivos estáticos
  if (parsedUrl.pathname.startsWith('/public/')) {
    const filePath = `.${parsedUrl.pathname}`;
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Arquivo não encontrado');
      } else {
        const ext = filePath.split('.').pop();
        const contentType = ext === 'png' || ext === 'jpg' || ext === 'jpeg' ? 'image/' + ext : 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
    return;
  }

  // Rota raiz - redirecionar para login
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '') {
    res.writeHead(302, { 'Location': '/login' });
    res.end();
    return;
  }

  if (parsedUrl.pathname.startsWith('/groups')) {
    return groupRoutes(req, res);
  }
  if (
    parsedUrl.pathname.startsWith('/register') ||
    parsedUrl.pathname.startsWith('/login') ||
    parsedUrl.pathname.startsWith('/logout') ||
    parsedUrl.pathname.startsWith('/users') ||
    parsedUrl.pathname.startsWith('/api/users') ||
    parsedUrl.pathname.startsWith('/user/delete')
  ) {
    console.log('🔄 Chamando userRoutes...');
    try {
      return userRoutes.userRoutes(req, res);
    } catch (error) {
      console.error('❌ Erro no userRoutes:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
    }
  }
  if (
    parsedUrl.pathname.startsWith('/chat') ||
    parsedUrl.pathname.startsWith('/api/chat')
  ) {
    return chatRoutes(req, res);
  }

  res.writeHead(302, { 'Location': '/login' });
  res.end();
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`� Acesse http://localhost:${PORT} - Página inicial (Login)`);
  console.log(`➕ Acesse http://localhost:${PORT}/register para se registrar`);
  console.log(`💬 Chat disponível após login autenticado`);
  console.log(`👥 Lista de usuários disponível após login autenticado`);
  console.log(`\n�️  Sistema de autenticação ativo - páginas protegidas por sessão`);
});