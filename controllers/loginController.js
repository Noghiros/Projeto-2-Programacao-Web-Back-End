const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

// Arquivo JSON para armazenamento temporário (fallback se MongoDB não estiver disponível)
const usersFile = path.join(__dirname, '../data/users.json');
const sessionsFile = path.join(__dirname, '../data/sessions.json');

// Função para ler usuários do arquivo JSON
const readUsersFromFile = () => {
    try {
        if (fs.existsSync(usersFile)) {
            const data = fs.readFileSync(usersFile, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.log('Erro ao ler arquivo de usuários:', error);
        return [];
    }
};

// Função para gerenciar sessões
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

const saveSessionsToFile = (sessions) => {
    try {
        fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2));
        return true;
    } catch (error) {
        console.log('Erro ao salvar arquivo de sessões:', error);
        return false;
    }
};

// Criar uma nova sessão
const createSession = (userId, userName) => {
    const sessionId = Date.now().toString() + Math.random().toString(36);
    const sessions = readSessionsFromFile();
    sessions[sessionId] = {
        userId: userId,
        userName: userName,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };
    saveSessionsToFile(sessions);
    return sessionId;
};

// Verificar se sessão é válida
const isValidSession = (sessionId) => {
    const sessions = readSessionsFromFile();
    const session = sessions[sessionId];
    if (!session) return null;
    
    // Verificar se não expirou
    if (new Date() > new Date(session.expiresAt)) {
        delete sessions[sessionId];
        saveSessionsToFile(sessions);
        return null;
    }
    
    return session;
};

// Destruir sessão
const destroySession = (sessionId) => {
    const sessions = readSessionsFromFile();
    delete sessions[sessionId];
    saveSessionsToFile(sessions);
};

// Exibe a página de login
const loadLogin = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../views/login.html');
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.log('Erro ao ler arquivo:', err);
                res.writeHead(500);
                res.end("Erro ao carregar página de login");
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(data);
            }
        });
    } catch (error) {
        console.log(error.message);
        res.writeHead(500);
        res.end("Erro interno");
    }
};

// Realiza login do usuário
const login = async (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        const params = new URLSearchParams(body);
        const email = params.get('email');
        const password = params.get('password');

        if (!email || !password) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(`
                <div style="font-family: Arial, sans-serif; text-align: center; margin: 50px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                    <h1 style="color: #dc3545;">❌ Erro</h1>
                    <p>Email e senha são obrigatórios</p>
                    <a href="/login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">🔙 Voltar</a>
                </div>
            `);
        }

        try {
            let userData = null;
            
            // Tentar buscar do MongoDB primeiro
            try {
                userData = await User.findOne({ email });
                console.log('Usuário encontrado no MongoDB');
            } catch (mongoError) {
                console.log('MongoDB não disponível, buscando no arquivo JSON');
                // Se falhar, buscar no arquivo JSON
                const users = readUsersFromFile();
                userData = users.find(u => u.email === email);
                console.log('Usuário encontrado no arquivo:', userData ? 'Sim' : 'Não');
            }

            if (!userData) {
                res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(`
                    <div style="font-family: Arial, sans-serif; text-align: center; margin: 50px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                        <h1 style="color: #dc3545;">🚫 Acesso Negado</h1>
                        <p>Email ou senha incorretos</p>
                        <a href="/login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">🔙 Voltar</a>
                    </div>
                `);
            }

            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (!passwordMatch) {
                res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(`
                    <div style="font-family: Arial, sans-serif; text-align: center; margin: 50px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                        <h1 style="color: #dc3545;">🚫 Acesso Negado</h1>
                        <p>Email ou senha incorretos</p>
                        <a href="/login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">🔙 Voltar</a>
                    </div>
                `);
            }

            // Login bem-sucedido - criar sessão e redirecionar
            const sessionId = createSession(userData._id || userData.email, userData.name);
            
            res.writeHead(200, { 
                'Content-Type': 'text/html; charset=utf-8',
                'Set-Cookie': `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400` // 24 horas
            });
            res.end(`
                <div style="font-family: Arial, sans-serif; text-align: center; margin: 50px; padding: 20px; background: linear-gradient(135deg, #28a745, #20c997); color: white; border-radius: 8px;">
                    <h1>✅ Login realizado com sucesso!</h1>
                    <p>Bem-vindo, <strong>${userData.name}</strong>!</p>
                    <p>Redirecionando para o chat...</p>
                    <script>
                        // Salvar dados do usuário no localStorage também
                        localStorage.setItem('currentUser', JSON.stringify({
                            id: '${userData._id || userData.email}',
                            name: '${userData.name}',
                            email: '${userData.email}'
                        }));
                        
                        setTimeout(function() {
                            window.location.href = '/chat';
                        }, 2000);
                    </script>
                    <div style="margin-top: 20px;">
                        <a href="/chat" style="background-color: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">� Ir para Chat</a> 
                        <a href="/users" style="background-color: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">👥 Lista de usuários</a>
                    </div>
                </div>
            `);
            
        } catch (error) {
            console.log('Erro no login:', error.message);
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <div style="font-family: Arial, sans-serif; text-align: center; margin: 50px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                    <h1 style="color: #dc3545;">⚠️ Erro no Sistema</h1>
                    <p>Erro ao fazer login: ${error.message}</p>
                    <a href="/login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">🔄 Tente novamente</a>
                </div>
            `);
        }
    });
};

// Função para fazer logout
const logout = async (req, res) => {
    // Extrair sessionId do cookie
    const cookies = req.headers.cookie || '';
    const sessionId = cookies.split(';')
        .find(c => c.trim().startsWith('sessionId='))
        ?.split('=')[1];
    
    // Destruir sessão se existir
    if (sessionId) {
        destroySession(sessionId);
    }
    
    res.writeHead(200, { 
        'Content-Type': 'text/html; charset=utf-8',
        'Set-Cookie': 'sessionId=; HttpOnly; Path=/; Max-Age=0' // Remover cookie
    });
    res.end(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Logout - Sistema de Chat</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #7289da 0%, #5b6eae 100%);
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .logout-container {
                    background-color: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                }
                .logout-icon {
                    font-size: 4em;
                    margin-bottom: 20px;
                }
                h1 {
                    color: #333;
                    margin-bottom: 20px;
                }
                p {
                    color: #666;
                    margin-bottom: 30px;
                }
                .btn-group {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 5px;
                    text-decoration: none;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #7289da 0%, #5b6eae 100%);
                    color: white;
                }
                .btn-secondary {
                    background: #f8f9fa;
                    color: #666;
                    border: 2px solid #ddd;
                }
                .btn:hover {
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="logout-container">
                <div class="logout-icon">👋</div>
                <h1>Logout realizado!</h1>
                <p>Você foi desconectado do sistema com sucesso.</p>
                
                <div class="btn-group">
                    <a href="/login" class="btn btn-primary">
                        🔐 Fazer Login Novamente
                    </a>
                    <a href="/register" class="btn btn-secondary">
                        ➕ Registrar Nova Conta
                    </a>
                </div>
            </div>
            
            <script>
                // Limpar dados do localStorage
                localStorage.removeItem('currentUser');
                localStorage.clear();
                
                console.log(' Logout realizado - localStorage limpo');
            </script>
        </body>
        </html>
    `);
};

module.exports = {
    loadLogin,
    login,
    logout,
    isValidSession,
    createSession,
    destroySession
};
