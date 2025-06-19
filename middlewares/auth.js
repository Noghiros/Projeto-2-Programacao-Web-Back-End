const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
});

const isLogin = (session) => {
    if (session && session.user) {
        // Usuário já está logado
        return { redirect: '/dashboard' };
    }
    // Usuário não está logado, pode prosseguir
    return { proceed: true };
};

const isLogout = (session) => {
    if (!session || !session.user) {
        // Usuário não está logado
        return { redirect: '/login' };
    }
    // Usuário está logado, pode prosseguir
    return { proceed: true };
};

// Middleware Express 
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Acesso não autorizado.' }));
}

// Configuração da sessão
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'seu_segredo_aqui',
    resave: false,
    saveUninitialized: false
}));

module.exports = {
    isLogin,
    isLogout,
    requireAuth
};
