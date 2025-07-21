const jwt = require('jsonwebtoken');
const { User, Professional } = require('../models');
const jwtConfig = require('../config/jwt');

// Função para gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

// Registro de novo usuário
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      phone,
      cpf,
      birth_date,
      user_type,
      // Campos específicos para profissionais
      specialty,
      crp,
      price_per_session,
      bio,
      experience_years
    } = req.body;

    // Verificar se o email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Verificar se o CPF já existe
    const existingCpf = await User.findOne({ where: { cpf } });
    if (existingCpf) {
      return res.status(400).json({
        success: false,
        message: 'CPF já está cadastrado'
      });
    }

    // Se for profissional, verificar se o CRP já existe
    if (user_type === 'professional' && crp) {
      const existingCrp = await Professional.findOne({ where: { crp } });
      if (existingCrp) {
        return res.status(400).json({
          success: false,
          message: 'CRP já está cadastrado'
        });
      }
    }

    // Criar o usuário
    const user = await User.create({
      email,
      password, // A senha será hasheada automaticamente pelo hook do modelo
      full_name,
      phone,
      cpf,
      birth_date,
      user_type
    });

    // Se for profissional, criar o registro de profissional
    if (user_type === 'professional') {
      await Professional.create({
        user_id: user.id,
        specialty: specialty || '',
        crp: crp || '',
        price_per_session: price_per_session || 0,
        bio: bio || '',
        experience_years: experience_years || 0,
        rating: 0,
        total_consultations: 0
      });
    }

    // Gerar token JWT
    const token = generateToken(user.id);

    // Buscar o usuário completo (sem a senha) para retornar
    const userResponse = await User.findByPk(user.id, {
      attributes: { exclude: ['password_hash'] },
      include: user_type === 'professional' ? [{
        model: Professional,
        as: 'professional'
      }] : []
    });

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login de usuário
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar o usuário pelo email
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Professional,
        as: 'professional'
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar a senha
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar token JWT
    const token = generateToken(user.id);

    // Preparar resposta sem a senha
    const userResponse = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      cpf: user.cpf,
      birth_date: user.birth_date,
      user_type: user.user_type,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    // Se for profissional, incluir dados do profissional
    if (user.user_type === 'professional' && user.professional) {
      userResponse.professional = user.professional;
    }

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verificar token (para validar se o usuário ainda está logado)
const verifyToken = async (req, res) => {
  try {
    // O middleware authenticateToken já validou o token e adicionou o usuário ao req
    const user = req.user;

    // Se for profissional, buscar dados do profissional
    let userResponse = user.toJSON();
    if (user.user_type === 'professional') {
      const professional = await Professional.findOne({ 
        where: { user_id: user.id } 
      });
      if (professional) {
        userResponse.professional = professional;
      }
    }

    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  verifyToken
};

