const http = require('http');
const fs = require('fs');
const url = require('url');
const groupRoutes = require('./routes/groupRoute');
const userRoutes = require('./routes/userRoute');
const chatRoutes = require('./routes/chatRoute');
const mongoose = require('mongoose');
const errorLogger = require('./middlewares/errorLogger');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/whatsapp2', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Conectado ao MongoDB!");
}).catch((err) => {
  console.error("Erro na conexão com MongoDB:", err);
});

const redisClient = createClient({ legacyMode: true });
redisClient.connect().catch(console.error);

const PORT = 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname.startsWith('/groups')) {
    return groupRoutes(req, res);
  }
  if (
    parsedUrl.pathname.startsWith('/register') ||
    parsedUrl.pathname.startsWith('/login')
  ) {
    return userRoutes(req, res);
  }
  if (parsedUrl.pathname.startsWith('/chat')) {
    return chatRoutes(req, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Rota não encontrada' }));
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'sua_chave_secreta', // troque por uma chave forte
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true se usar HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hora
  }
}));
app.use('/', userRoutes);

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});