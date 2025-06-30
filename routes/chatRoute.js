const chatController = require('../controllers/chatController');
const formidable = require('formidable');
const { requireAuth } = require('../middlewares/auth');

module.exports = (req, res) => {
    const { url, method } = req;

    // Página de chat (interface visual) - PROTEGIDA
    if (url === '/chat' && method === 'GET') {
        return requireAuth(req, res, () => {
            chatController.chatPage(req, res);
        });
    }
    
    // API para listar mensagens - PROTEGIDA
    if (url === '/api/chat' && method === 'GET') {
        return requireAuth(req, res, () => {
            chatController.listMessages(req, res);
        });
    }
    
    // Enviar mensagem - PROTEGIDA
    if (url === '/chat' && method === 'POST') {
        return requireAuth(req, res, () => {
            const form = new formidable.IncomingForm();
            form.parse(req, (err, fields) => {
                if (err) {
                    console.log('Erro no formidable:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro no processamento do formulário' }));
                } else {
                    chatController.createMessage(req, res, fields);
                }
            });
        });
    }
    
    // Excluir mensagem - PROTEGIDA
    else if (url.startsWith('/chat/delete/') && method === 'DELETE') {
        return requireAuth(req, res, () => {
            chatController.deleteMessage(req, res);
        });
    }
    
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Rota não encontrada' }));
    }
};