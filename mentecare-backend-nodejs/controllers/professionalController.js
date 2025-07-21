const { User, Professional } = require('../models');
const { Op } = require('sequelize');

// Buscar profissionais com filtros
const searchProfessionals = async (req, res) => {
  try {
    const {
      specialty,
      min_price,
      max_price,
      rating,
      experience_years,
      approach,
      language,
      page = 1,
      limit = 10
    } = req.query;

    // Construir filtros dinâmicos
    const whereClause = {
      is_available: true,
      is_verified: true
    };

    if (specialty) {
      whereClause.specialty = {
        [Op.like]: `%${specialty}%`
      };
    }

    if (min_price || max_price) {
      whereClause.consultation_price = {};
      if (min_price) whereClause.consultation_price[Op.gte] = parseFloat(min_price);
      if (max_price) whereClause.consultation_price[Op.lte] = parseFloat(max_price);
    }

    if (rating) {
      whereClause.rating = {
        [Op.gte]: parseFloat(rating)
      };
    }

    if (experience_years) {
      whereClause.experience_years = {
        [Op.gte]: parseInt(experience_years)
      };
    }

    if (approach) {
      whereClause.approach = {
        [Op.like]: `%${approach}%`
      };
    }

    if (language) {
      whereClause.languages = {
        [Op.like]: `%${language}%`
      };
    }

    // Calcular offset para paginação
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Buscar profissionais
    const { count, rows: professionals } = await Professional.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone']
      }],
      limit: parseInt(limit),
      offset: offset,
      order: [['rating', 'DESC'], ['total_reviews', 'DESC']]
    });

    // Calcular informações de paginação
    const totalPages = Math.ceil(count / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      message: 'Profissionais encontrados com sucesso',
      data: {
        professionals,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Erro na busca de profissionais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter detalhes de um profissional específico
const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await Professional.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone']
      }]
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Profissional encontrado com sucesso',
      data: {
        professional
      }
    });

  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter profissional pelo user_id (para profissionais logados)
const getProfessionalByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Verificar se o usuário logado pode acessar estes dados
    if (req.user.id !== parseInt(user_id) && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const professional = await Professional.findOne({
      where: { user_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone', 'user_type']
      }]
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Profissional encontrado com sucesso',
      data: {
        professional
      }
    });

  } catch (error) {
    console.error('Erro ao buscar profissional por user_id:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Atualizar perfil do profissional
const updateProfessional = async (req, res) => {
  try {
    const { user_id } = req.params;
    const {
      specialty,
      bio,
      experience_years,
      consultation_price,
      approach,
      languages,
      is_available
    } = req.body;

    // Verificar se o usuário logado pode atualizar estes dados
    if (req.user.id !== parseInt(user_id)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Verificar se o usuário é um profissional
    if (req.user.user_type !== 'professional') {
      return res.status(403).json({
        success: false,
        message: 'Apenas profissionais podem atualizar este perfil'
      });
    }

    const professional = await Professional.findOne({ where: { user_id } });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }

    // Atualizar dados
    const updateData = {};
    if (specialty !== undefined) updateData.specialty = specialty;
    if (bio !== undefined) updateData.bio = bio;
    if (experience_years !== undefined) updateData.experience_years = experience_years;
    if (consultation_price !== undefined) updateData.consultation_price = consultation_price;
    if (approach !== undefined) updateData.approach = approach;
    if (languages !== undefined) updateData.languages = languages;
    if (is_available !== undefined) updateData.is_available = is_available;

    await professional.update(updateData);

    // Buscar profissional atualizado
    const updatedProfessional = await Professional.findOne({
      where: { user_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone']
      }]
    });

    res.json({
      success: true,
      message: 'Perfil profissional atualizado com sucesso',
      data: {
        professional: updatedProfessional
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Listar todas as especialidades disponíveis
const getSpecialties = async (req, res) => {
  try {
    const specialties = await Professional.findAll({
      attributes: ['specialty'],
      where: {
        is_available: true,
        is_verified: true,
        specialty: {
          [Op.ne]: ''
        }
      },
      group: ['specialty'],
      order: [['specialty', 'ASC']]
    });

    const specialtyList = specialties.map(p => p.specialty).filter(s => s && s.trim() !== '');

    res.json({
      success: true,
      message: 'Especialidades encontradas com sucesso',
      data: {
        specialties: specialtyList
      }
    });

  } catch (error) {
    console.error('Erro ao buscar especialidades:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  searchProfessionals,
  getProfessionalById,
  getProfessionalByUserId,
  updateProfessional,
  getSpecialties
};

