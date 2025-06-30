const fs = require('fs');
const path = require('path');

// Arquivo JSON para armazenamento
const messagesFile = path.join(__dirname, '../data/messages.json');

// Função para ler mensagens do arquivo JSON
const readMessagesFromFile = () => {
    try {
        if (fs.existsSync(messagesFile)) {
            const data = fs.readFileSync(messagesFile, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.log('Erro ao ler arquivo de mensagens:', error);
        return [];
    }
};

// Função para salvar mensagens no arquivo JSON
const saveMessagesToFile = (messages) => {
    try {
        fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
        return true;
    } catch (error) {
        console.log('Erro ao salvar arquivo de mensagens:', error);
        return false;
    }
};

// Exibe a página de chat
const chatPage = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../views/chat.html');
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.log('Erro ao ler arquivo:', err);
                res.writeHead(500);
                res.end("Erro ao carregar página de chat");
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

// Cria mensagem
const createMessage = async (req, res, fields) => {
  const { sender, receiver, message, sender_id } = fields || req.body;
  
  if (!message || !sender) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Remetente e mensagem são obrigatórios.' }));
  }
  
  try {
    // Ler mensagens existentes
    const messages = readMessagesFromFile();
    
    // Criar nova mensagem
    const newMessage = {
      _id: Date.now().toString(),
      sender: Array.isArray(sender) ? sender[0] : sender,
      sender_id: Array.isArray(sender_id) ? sender_id[0] : sender_id,
      receiver: Array.isArray(receiver) ? receiver[0] : receiver || 'Geral',
      message: Array.isArray(message) ? message[0] : message,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    
    // Adicionar à lista
    messages.push(newMessage);
    
    // Salvar no arquivo
    const saved = saveMessagesToFile(messages);
    
    if (!saved) {
      throw new Error('Falha ao salvar mensagem');
    }
    
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newMessage));
  } catch (error) {
    console.log('Erro ao criar mensagem:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Erro interno ao enviar mensagem.' }));
  }
};

//Lista mensagens
const listMessages = async (req, res) => {
    try {
        const messages = readMessagesFromFile();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(messages));
    } catch (error) {
        console.log('Erro ao listar mensagens:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro ao listar mensagens.' }));
    }
};

// Exclui mensagem
const deleteMessage = async (req, res) => {
    const messageId = req.url.split('/').pop();
    try {
        const messages = readMessagesFromFile();
        const filteredMessages = messages.filter(msg => msg._id !== messageId);
        
        const saved = saveMessagesToFile(filteredMessages);
        if (!saved) {
            throw new Error('Falha ao salvar após exclusão');
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Mensagem excluída com sucesso' }));
    } catch (error) {
        console.log('Erro ao excluir mensagem:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro ao excluir mensagem' }));
    }
};

module.exports = { createMessage, listMessages, deleteMessage, chatPage };