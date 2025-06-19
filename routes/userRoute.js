const fs = require('fs');
const path = require('path');
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const formidable = require('formidable');
const loginController = require('../controllers/loginController');
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');

router.get('/dashboard', requireAuth, (req, res) => {
    res.send('Bem-vindo à área protegida!');
});

router.delete('/user/delete/:id', requireAuth, (req, res) => {
    const id = req.params.id;
    return userController.deleteUser(req, res, id);
});

function userRoutes(req, res) {
    const { url, method } = req;

    if (url === '/register' && method === 'GET') {
        fs.readFile('./views/register.html', 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Erro interno');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (url === '/register' && method === 'POST') {
            const form = new formidable.IncomingForm({
                uploadDir: path.join(__dirname, '../public/images'),
                keepExtensions: true,
                allowEmptyFiles: true, // <-- Adicione esta linha
                filename: (name, ext, part, form) => {
                    return Date.now() + '_' + part.originalFilename;
                }
            });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end('Erro no upload');
            } else {
                userController.register(req, res, fields, files);
            }
        });
    } else if (url === '/login' && method === 'POST') {
        loginController.login(req, res);
    } else if (url === '/logout' && method === 'POST') {
        loginController.logout(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Rota não encontrada' }));
    }
}

module.exports = { userRoutes, router };
