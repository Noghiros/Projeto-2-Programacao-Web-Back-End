const fs = require('fs');
const path = require('path');
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const formidable = require('formidable');
const loginController = require('../controllers/loginController');
const express = require('express');
const router = express.Router();
const { requireAuth, redirectIfAuthenticated } = require('../middlewares/auth');

router.get('/dashboard', requireAuth, (req, res) => {
    res.send('Bem-vindo à área protegida!');
});

router.delete('/user/delete/:id', requireAuth, (req, res) => {
    const id = req.params.id;
    return userController.deleteUser(req, res, id);
});

router.get('/login', loginController.loadLogin);
router.post('/login', loginController.login);
router.post('/logout', loginController.logout);

function userRoutes(req, res) {
    const { url, method } = req;
    console.log(`🔍 UserRoutes: ${method} ${url}`);

    // Páginas públicas (não requerem autenticação)
    if (url === '/register' && method === 'GET') {
        return redirectIfAuthenticated(req, res, () => {
            userController.registerLoad(req, res);
        });
    } else if (url === '/register' && method === 'POST') {
        return userController.register(req, res);
    } else if (url === '/login' && method === 'GET') {
        return redirectIfAuthenticated(req, res, () => {
            loginController.loadLogin(req, res);
        });
    } else if (url === '/login' && method === 'POST') {
        return loginController.login(req, res);
    } else if (url === '/logout' && method === 'GET') {
        return loginController.logout(req, res);
    } else if (url === '/logout' && method === 'POST') {
        return loginController.logout(req, res);
    }
    
    // Páginas protegidas (requerem autenticação)
    else if (url === '/users' && method === 'GET') {
        return requireAuth(req, res, () => {
            userController.listUsersPage(req, res);
        });
    } else if (url === '/api/users' && method === 'GET') {
        return requireAuth(req, res, () => {
            userController.getAllUsers(req, res);
        });
    } else if (url.startsWith('/user/delete/') && method === 'DELETE') {
        return requireAuth(req, res, () => {
            userController.deleteUser(req, res);
        });
    } else {
        console.log(`❌ Rota não encontrada: ${method} ${url}`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Rota não encontrada' }));
    }
}

module.exports = { userRoutes, router };
