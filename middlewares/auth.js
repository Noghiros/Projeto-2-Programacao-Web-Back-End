const fs = require('fs');
const path = require('path');

// Arquivo de sessões
const sessionsFile = path.join(__dirname, '../data/sessions.json');

// Função para ler sessões
const readSessionsFromFile = () => {
    try {
        if (fs.existsSync(sessionsFile)) {
            const data = fs.readFileSync(sessionsFile, 'utf8');
            return JSON.parse(data);
        }
        return {};
    } catch (error) {
        console.log('Erro ao ler arquivo de sessões:', error);
        return {};
    }
};

// Verificar se sessão é válida
const isValidSession = (sessionId) => {
    const sessions = readSessionsFromFile();
    const session = sessions[sessionId];
    if (!session) return null;
    
    // Verificar se não expirou
    if (new Date() > new Date(session.expiresAt)) {
        return null;
    }
    
    return session;
};

// Extrair sessionId do cookie
const getSessionIdFromCookies = (cookieHeader) => {
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';');
    const sessionCookie = cookies.find(c => c.trim().startsWith('sessionId='));
    return sessionCookie ? sessionCookie.split('=')[1] : null;
};

// Middleware para verificar autenticação
const requireAuth = (req, res, next) => {
    const sessionId = getSessionIdFromCookies(req.headers.cookie);
    const session = sessionId ? isValidSession(sessionId) : null;
    
    if (!session) {
        // Não autenticado - redirecionar para login
        res.writeHead(302, { 'Location': '/login' });
        res.end();
        return;
    }
    
    // Adicionar dados da sessão ao request
    req.user = session;
    next();
};

// Middleware para páginas que não requerem autenticação
const redirectIfAuthenticated = (req, res, next) => {
    const sessionId = getSessionIdFromCookies(req.headers.cookie);
    const session = sessionId ? isValidSession(sessionId) : null;
    
    if (session) {
        // Já autenticado - redirecionar para chat
        res.writeHead(302, { 'Location': '/chat' });
        res.end();
        return;
    }
    
    next();
};

module.exports = {
    requireAuth,
    redirectIfAuthenticated,
    isValidSession,
    getSessionIdFromCookies
};
