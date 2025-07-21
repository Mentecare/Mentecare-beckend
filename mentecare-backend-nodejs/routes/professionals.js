const express = require('express');
const router = express.Router();

// Importar controladores e middlewares
const {
  searchProfessionals,
  getProfessionalById,
  getProfessionalByUserId,
  updateProfessional,
  getSpecialties
} = require('../controllers/professionalController');

const { authenticateToken, requireProfessional } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Validações para atualização de profissional
const validateProfessionalUpdate = [
  body('specialty')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Especialidade deve ter pelo menos 2 caracteres'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Biografia deve ter no máximo 1000 caracteres'),
  
  body('experience_years')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Anos de experiência deve ser um número inteiro positivo'),
  
  body('consultation_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço da consulta deve ser um número positivo'),
  
  body('approach')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Abordagem deve ter no máximo 200 caracteres'),
  
  body('languages')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Idiomas deve ter no máximo 100 caracteres'),
  
  body('is_available')
    .optional()
    .isBoolean()
    .withMessage('Disponibilidade deve ser verdadeiro ou falso'),
  
  handleValidationErrors
];

// Rotas públicas (não requerem autenticação)

// Buscar profissionais com filtros
// GET /api/professionals/search?specialty=psicologia&min_price=50&max_price=200
router.get('/search', searchProfessionals);

// Listar especialidades disponíveis (deve vir antes de /:id)
// GET /api/professionals/specialties
router.get('/specialties', getSpecialties);

// Obter detalhes de um profissional específico
// GET /api/professionals/:id
router.get('/:id', getProfessionalById);

// Rotas protegidas (requerem autenticação)

// Obter profissional pelo user_id (para profissionais logados)
// GET /api/professionals/user/:user_id
router.get('/user/:user_id', authenticateToken, getProfessionalByUserId);

// Atualizar perfil do profissional
// PUT /api/professionals/user/:user_id
router.put('/user/:user_id', 
  authenticateToken, 
  requireProfessional, 
  validateProfessionalUpdate, 
  updateProfessional
);

module.exports = router;

