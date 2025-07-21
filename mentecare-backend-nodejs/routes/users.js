const express = require('express');
const router = express.Router();

// Importar controladores e middlewares
const {
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
  deactivateAccount
} = require('../controllers/userController');

const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Validações para atualização de perfil
const validateProfileUpdate = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nome completo deve ter pelo menos 2 caracteres'),
  
  body('phone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
  
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Data de nascimento deve estar no formato YYYY-MM-DD'),
  
  body('gender')
    .optional()
    .isIn(['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'])
    .withMessage('Gênero deve ser uma opção válida'),
  
  handleValidationErrors
];

// Validações para alteração de senha
const validatePasswordChange = [
  body('current_password')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  
  handleValidationErrors
];

// Validações para desativação de conta
const validateAccountDeactivation = [
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória para desativar a conta'),
  
  handleValidationErrors
];

// Todas as rotas requerem autenticação

// Obter perfil do usuário logado
// GET /api/users/profile
router.get('/profile', authenticateToken, getProfile);

// Atualizar perfil do usuário
// PUT /api/users/profile
router.put('/profile', authenticateToken, validateProfileUpdate, updateProfile);

// Alterar senha do usuário
// PUT /api/users/change-password
router.put('/change-password', authenticateToken, validatePasswordChange, changePassword);

// Obter usuário por ID (apenas para o próprio usuário ou admin)
// GET /api/users/:id
router.get('/:id', authenticateToken, getUserById);

// Desativar conta do usuário
// POST /api/users/deactivate
router.post('/deactivate', authenticateToken, validateAccountDeactivation, deactivateAccount);

module.exports = router;

