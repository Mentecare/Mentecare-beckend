const express = require('express');
const router = express.Router();

// Importar controladores e middlewares
const { register, login, verifyToken } = require('../controllers/authController');
const { validateUserRegistration, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Rota para registro de usuário
// POST /api/auth/register
router.post('/register', validateUserRegistration, register);

// Rota para login
// POST /api/auth/login
router.post('/login', validateLogin, login);

// Rota para verificar token (usuário logado)
// GET /api/auth/verify
router.get('/verify', authenticateToken, verifyToken);

// Rota para logout (opcional - no frontend apenas remove o token)
// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

module.exports = router;

