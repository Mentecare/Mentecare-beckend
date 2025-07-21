const { User, Professional, sequelize } = require('../models');

const seedUsers = [
  {
    email: 'amanda.silva@email.com',
    password: '123456',
    full_name: 'Amanda Silva',
    phone: '(11) 99999-1111',
    date_of_birth: '1990-05-15',
    gender: 'Feminino',
    cpf: '123.456.789-01',
    user_type: 'patient'
  },
  {
    email: 'carlos.santos@email.com',
    password: '123456',
    full_name: 'Carlos Santos',
    phone: '(11) 99999-2222',
    date_of_birth: '1985-08-22',
    gender: 'Masculino',
    cpf: '987.654.321-02',
    user_type: 'patient'
  },
  {
    email: 'novo.teste@email.com',
    password: 'NovaSenha123',
    full_name: 'Novo Usuário Teste',
    phone: '(11) 99999-0000',
    date_of_birth: '2000-01-01',
    gender: 'Outro',
    cpf: '000.000.000-00',
    user_type: 'patient'
  }
];

const seedProfessionals = [
  {
    email: 'dr.ana.costa@email.com',
    password: '123456',
    full_name: 'Dra. Ana Costa',
    phone: '(11) 99999-3333',
    date_of_birth: '1980-03-10',
    gender: 'Feminino',
    cpf: '111.222.333-44',
    user_type: 'professional',
    professional: {
      crp_crm: 'CRP 06/123456',
      specialty: 'Psicologia Clínica',
      bio: 'Psicóloga especializada em terapia cognitivo-comportamental com mais de 10 anos de experiência no atendimento de adultos com ansiedade e depressão.',
      experience_years: 10,
      consultation_price: 120.0,
      approach: 'Terapia Cognitivo-Comportamental',
      languages: 'Português, Inglês',
      is_verified: true,
      rating: 4.8,
      total_reviews: 45,
      is_available: true
    }
  },
  {
    email: 'dr.roberto.silva@email.com',
    password: '123456',
    full_name: 'Dr. Roberto Silva',
    phone: '(11) 99999-4444',
    date_of_birth: '1975-07-25',
    gender: 'Masculino',
    cpf: '555.666.777-88',
    user_type: 'professional',
    professional: {
      crp_crm: 'CRM 123456',
      specialty: 'Psiquiatria',
      bio: 'Médico psiquiatra com especialização em transtornos de humor e ansiedade. Atendimento humanizado e baseado em evidências científicas.',
      experience_years: 15,
      consultation_price: 200.0,
      approach: 'Psiquiatria Baseada em Evidências',
      languages: 'Português, Espanhol',
      is_verified: true,
      rating: 4.9,
      total_reviews: 78,
      is_available: true
    }
  },
  {
    email: 'dra.maria.oliveira@email.com',
    password: '123456',
    full_name: 'Dra. Maria Oliveira',
    phone: '(11) 99999-5555',
    date_of_birth: '1982-12-05',
    gender: 'Feminino',
    cpf: '999.888.777-66',
    user_type: 'professional',
    professional: {
      crp_crm: 'CRP 06/789012',
      specialty: 'Psicologia Infantil',
      bio: 'Psicóloga especializada no atendimento de crianças e adolescentes. Experiência em terapia lúdica e orientação familiar.',
      experience_years: 8,
      consultation_price: 100.0,
      approach: 'Terapia Lúdica e Sistêmica',
      languages: 'Português',
      is_verified: true,
      rating: 4.7,
      total_reviews: 32,
      is_available: true
    }
  },
  {
    email: 'dr.pedro.almeida@email.com',
    password: '123456',
    full_name: 'Dr. Pedro Almeida',
    phone: '(11) 99999-6666',
    date_of_birth: '1978-09-18',
    gender: 'Masculino',
    cpf: '444.333.222-11',
    user_type: 'professional',
    professional: {
      crp_crm: 'CRP 06/345678',
      specialty: 'Psicologia Organizacional',
      bio: 'Psicólogo especializado em saúde mental no trabalho, burnout e desenvolvimento de carreira. Atendimento individual e em grupo.',
      experience_years: 12,
      consultation_price: 150.0,
      approach: 'Psicologia Positiva e Coaching',
      languages: 'Português, Inglês, Francês',
      is_verified: true,
      rating: 4.6,
      total_reviews: 28,
      is_available: true
    }
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando população do banco de dados...');
    
    // Limpar dados existentes
    await sequelize.sync({ force: true });
    console.log('✅ Banco de dados limpo e sincronizado.');
    
    // Criar usuários pacientes
    console.log('👥 Criando usuários pacientes...');
    for (const userData of seedUsers) {
      const user = await User.create(userData);
      console.log(`✅ Paciente criado: ${user.full_name} (${user.email})`);
    }
    
    // Criar usuários profissionais
    console.log('👨‍⚕️ Criando usuários profissionais...');
    for (const profData of seedProfessionals) {
      const { professional, ...userData } = profData;
      
      // Criar usuário
      const user = await User.create(userData);
      console.log(`✅ Usuário profissional criado: ${user.full_name} (${user.email})`);
      
      // Criar perfil profissional
      const professionalProfile = await Professional.create({
        user_id: user.id,
        ...professional
      });
      console.log(`✅ Perfil profissional criado: ${professionalProfile.specialty}`);
    }
    
    console.log('🎉 População do banco de dados concluída com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`👥 Pacientes: ${seedUsers.length}`);
    console.log(`👨‍⚕️ Profissionais: ${seedProfessionals.length}`);
    console.log('🔑 Senha padrão para todos: 123456 (exceto novo.teste@email.com: NovaSenha123)');
    
  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
  }
};

module.exports = seedDatabase;

// Executar se chamado diretamente
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

