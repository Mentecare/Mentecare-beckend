const jwt = require('jsonwebtoken');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Buscar o usuário no banco de dados
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Adicionar o usuário ao objeto request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    } else {
      console.error('Erro na autenticação:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

// Middleware para verificar se o usuário é um profissional
const requireProfessional = async (req, res, next) => {
  try {
    if (req.user.user_type !== 'professional') {
      return res.status(403).json({
        success: false,
        message: 'Acesso restrito a profissionais'
      });
    }
    next();
  } catch (error) {
    console.error('Erro na verificação de profissional:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se o usuário é um paciente
const requirePatient = async (req, res, next) => {
  try {
    if (req.user.user_type !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Acesso restrito a pacientes'
      });
    }
    next();
  } catch (error) {
    console.error('Erro na verificação de paciente:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  authenticateToken,
  requireProfessional,
  requirePatient
};

