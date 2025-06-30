const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const formidable = require('formidable');

// Arquivo JSON para armazenamento
const usersFile = path.join(__dirname, '../data/users.json');

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

// Função para salvar usuários no arquivo JSON
const saveUsersToFile = (users) => {
    try {
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.log('Erro ao salvar arquivo de usuários:', error);
        return false;
    }
};

// Exibe a página de registro
const registerLoad = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../views/register.html');
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.log('Erro ao ler arquivo:', err);
                res.writeHead(500);
                res.end("Erro ao carregar página de registro");
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

// Realiza o registro
const register = async (req, res) => {
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, '../public/images'),
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowEmptyFiles: true,
        filter: function ({name, originalFilename, mimetype}) {
            return !mimetype || mimetype.includes("image");
        }
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log('Erro no formidable:', err);
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h1>Erro ao processar o formulário</h1><p>${err.message}</p><a href="/register">Voltar</a>`);
            return;
        }

        console.log('Fields recebidos:', fields);
        console.log('Files recebidos:', files);

        // Extrair valores dos campos
        const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
        const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
        const password = Array.isArray(fields.password) ? fields.password[0] : fields.password;

        if (!name || !email || !password) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(`<h1>Erro: Nome, email e senha são obrigatórios.</h1><a href="/register">Voltar</a>`);
        }

        try {
            // Verificar se o email já existe
            const users = readUsersFromFile();
            const existingUser = users.find(u => u.email === email);

            if (existingUser) {
                res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(`<h1>Erro: Email já está em uso!</h1><a href="/register">Voltar</a>`);
            }

            const passwordHash = await bcrypt.hash(password, 10);
            
            // Tratamento para arquivo de imagem
            let imagePath = 'default.png';
            if (files.image && files.image.size > 0 && files.image.newFilename) {
                imagePath = files.image.newFilename;
                console.log('Imagem salva:', imagePath);
            } else {
                console.log('Nenhuma imagem enviada, usando padrão');
            }

            const userData = {
                _id: Date.now().toString(),
                name: name,
                email: email,
                image: 'images/' + imagePath,
                password: passwordHash,
                is_online: false,
                createdAt: new Date()
            };

            // Salvar no arquivo JSON
            users.push(userData);
            const saved = saveUsersToFile(users);

            if (!saved) {
                throw new Error('Falha ao salvar usuário');
            }

            // Redirecionar para a página de usuários após o registro
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <div style="font-family: Arial, sans-serif; text-align: center; margin: 50px; padding: 20px; background: linear-gradient(135deg, #28a745, #20c997); color: white; border-radius: 8px;">
                    <h1> Cadastro realizado com sucesso!</h1>
                    <p>Usuário <strong>${name}</strong> foi registrado com sucesso!</p>
                    <p>Redirecionando para a lista de usuários...</p>
                    <script>
                        setTimeout(function() {
                            window.location.href = '/users';
                        }, 2000);
                    </script>
                    <div style="margin-top: 20px;">
                        <a href="/users" style="background-color: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">👥 Lista de usuários</a> 
                        <a href="/login" style="background-color: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">🔐 Fazer Login</a>
                    </div>
                </div>
            `);
        } catch (error) {
            console.log('Erro ao salvar usuário:', error.message);
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h1>Erro ao registrar.</h1><p>${error.message}</p><a href="/register">Tente novamente</a>`);
        }
    });
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
            return res.end(`<h1>Email e senha são obrigatórios</h1><a href="/login">Voltar</a>`);
        }

        try {
            // Buscar usuário no arquivo JSON
            const users = readUsersFromFile();
            const userData = users.find(u => u.email === email);

            if (!userData) {
                res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(`<h1>Email ou senha incorretos</h1><a href="/login">Voltar</a>`);
            }

            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (!passwordMatch) {
                res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(`<h1>Email ou senha incorretos</h1><a href="/login">Voltar</a>`);
            }

            // Login bem-sucedido
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <div style="font-family: Arial, sans-serif; text-align: center; margin: 50px; padding: 20px; background: linear-gradient(135deg, #28a745, #20c997); color: white; border-radius: 8px;">
                    <h1>✅ Login realizado com sucesso!</h1>
                    <p>Bem-vindo, <strong>${userData.name}</strong>!</p>
                    <p>Redirecionando para a lista de usuários...</p>
                    <script>
                        setTimeout(function() {
                            window.location.href = '/users';
                        }, 2000);
                    </script>
                    <div style="margin-top: 20px;">
                        <a href="/users" style="background-color: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">👥 Lista de usuários</a> 
                        <a href="/register" style="background-color: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">➕ Novo registro</a>
                    </div>
                </div>
            `);
            
        } catch (error) {
            console.log('Erro no login:', error.message);
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h1>Erro ao fazer login</h1><p>${error.message}</p><a href="/login">Tente novamente</a>`);
        }
    });
};

// Excluir usuário
const deleteUser = async (req, res) => {
    const userId = req.url.split('/').pop();
    try {
        const users = readUsersFromFile();
        const initialLength = users.length;
        const filteredUsers = users.filter(u => u._id !== userId);
        
        if (filteredUsers.length < initialLength) {
            const deleted = saveUsersToFile(filteredUsers);
            if (deleted) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuário excluído com sucesso' }));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Erro ao salvar arquivo' }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Usuário não encontrado' }));
        }
    } catch (error) {
        console.log('Erro ao deletar usuário:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro ao excluir usuário' }));
    }
};

// Exibe a página de listagem de usuários
const listUsersPage = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../views/users.html');
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.log('Erro ao ler arquivo:', err);
                res.writeHead(500);
                res.end("Erro ao carregar página de usuários");
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

// Busca todos os usuários (API)
const getAllUsers = async (req, res) => {
    try {
        const users = readUsersFromFile();
        // Remove a senha dos resultados
        const safeUsers = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(safeUsers));
    } catch (error) {
        console.log('Erro ao buscar usuários:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro ao buscar usuários' }));
    }
};

module.exports = {
    registerLoad,
    register,
    loadLogin,
    login,
    deleteUser,
    listUsersPage,
    getAllUsers
};
