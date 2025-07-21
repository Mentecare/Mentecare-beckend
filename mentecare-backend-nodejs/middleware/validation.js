const { body, validationResult } = require('express-validator');

// Middleware para verificar se há erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validações para registro de usuário
const validateUserRegistration = [
  body('email')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  
  body('full_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nome completo deve ter pelo menos 2 caracteres'),
  
  body('phone')
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
  
  body('cpf')
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato XXX.XXX.XXX-XX'),
  
  body('birth_date')
    .isISO8601()
    .withMessage('Data de nascimento deve estar no formato YYYY-MM-DD'),
  
  body('user_type')
    .isIn(['patient', 'professional'])
    .withMessage('Tipo de usuário deve ser "patient" ou "professional"'),
  
  handleValidationErrors
];

// Validações para login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  
  handleValidationErrors
];

// Validações para registro de profissional
const validateProfessionalRegistration = [
  body('specialty')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Especialidade deve ter pelo menos 2 caracteres'),
  
  body('crp')
    .matches(/^\d{2}\/\d{5}$/)
    .withMessage('CRP deve estar no formato XX/XXXXX'),
  
  body('price_per_session')
    .isFloat({ min: 0 })
    .withMessage('Preço por sessão deve ser um número positivo'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Biografia deve ter no máximo 1000 caracteres'),
  
  body('experience_years')
    .isInt({ min: 0 })
    .withMessage('Anos de experiência deve ser um número inteiro positivo'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateLogin,
  validateProfessionalRegistration,
  handleValidationErrors
};

