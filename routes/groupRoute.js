// routes/groupRoute.js

const groupController = require('../controllers/groupController');
const { requireAuth } = require('../middlewares/auth');

module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  if (path === '/groups' && method === 'POST') {
    // Protege a rota
    requireAuth(req, res, async () => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { name, members } = JSON.parse(body);
          const group = await groupController.createGroup(name, members);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(group));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Erro ao criar grupo.' }));
        }
      });
    });
    return;
  }

  if (path === '/groups' && method === 'GET') {
    // Se quiser proteger, coloque requireAuth aqui também
    try {
      const groups = await groupController.listGroups();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(groups));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro ao listar grupos.' }));
    }
    return;
  }

  if (path.startsWith('/groups/') && method === 'DELETE') {
    // Protege a rota
    requireAuth(req, res, async () => {
      const groupId = path.split('/')[2];
      try {
        await groupController.deleteGroup(groupId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Grupo removido com sucesso.' }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro ao deletar grupo.' }));
      }
    });
    return;



};  // Se nenhuma rota corresponder, retorna 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Rota não encontrada.' }));
};  
