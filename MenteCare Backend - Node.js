# MenteCare Backend - Node.js

> Backend em Node.js/Express.js para aplicação de telemedicina focada em saúde mental

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-blue.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3+-lightgrey.svg)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Deploy](#deploy)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O MenteCare Backend é uma API RESTful desenvolvida em Node.js que oferece serviços de telemedicina especializados em saúde mental. O sistema permite conexão entre pacientes e profissionais de saúde mental através de uma plataforma segura e acessível.

### Principais Objetivos

- **Acessibilidade:** Democratizar o acesso à saúde mental
- **Segurança:** Proteger dados sensíveis dos usuários
- **Escalabilidade:** Suportar crescimento da base de usuários
- **Performance:** Resposta rápida e confiável

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança
- Sistema de autenticação JWT
- Criptografia de senhas com bcrypt
- Validação de dados de entrada
- Rate limiting para proteção contra ataques

### 👥 Gestão de Usuários
- Registro e login de pacientes e profissionais
- Perfis personalizados por tipo de usuário
- Atualização de dados pessoais
- Sistema de permissões

### 👨‍⚕️ Gestão de Profissionais
- Cadastro de profissionais de saúde mental
- Busca avançada com filtros
- Sistema de avaliações e reviews
- Gestão de disponibilidade

### 🔍 Sistema de Busca
- Busca por especialidade
- Filtros por preço, avaliação e experiência
- Paginação de resultados
- Ordenação inteligente

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para banco de dados
- **SQLite** - Banco de dados (desenvolvimento)
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas

### Desenvolvimento
- **nodemon** - Auto-reload em desenvolvimento
- **dotenv** - Gerenciamento de variáveis de ambiente
- **express-validator** - Validação de dados
- **helmet** - Segurança HTTP
- **morgan** - Logging de requisições

### Deploy e Produção
- **PM2** - Gerenciador de processos
- **Nginx** - Proxy reverso
- **Docker** - Containerização (opcional)

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/mentecare-backend-nodejs.git
cd mentecare-backend-nodejs
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**
```bash
npm run db:sync
```

5. **Popule com dados iniciais (opcional)**
```bash
npm run db:seed
```

6. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 💻 Uso

### Desenvolvimento

```bash
# Iniciar em modo desenvolvimento (com auto-reload)
npm run dev

# Executar testes
npm test

# Verificar lint
npm run lint

# Sincronizar banco de dados
npm run db:sync

# Popular banco com dados de teste
npm run db:seed
```

### Produção

```bash
# Instalar dependências de produção
npm ci --only=production

# Iniciar com PM2
npm run start:prod

# Verificar status
npm run status

# Parar aplicação
npm run stop
```

## 📡 API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar novo usuário |
| POST | `/api/auth/login` | Login de usuário |
| GET | `/api/auth/verify` | Verificar token JWT |

### Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users/profile` | Obter perfil do usuário |
| PUT | `/api/users/profile` | Atualizar perfil |
| PUT | `/api/users/change-password` | Alterar senha |
| GET | `/api/users/:id` | Obter usuário por ID |

### Profissionais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/professionals/search` | Buscar profissionais |
| GET | `/api/professionals/specialties` | Listar especialidades |
| GET | `/api/professionals/:id` | Detalhes do profissional |
| PUT | `/api/professionals/user/:user_id` | Atualizar perfil profissional |

### Health Check

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Status da aplicação |

### Exemplos de Uso

#### Registrar Usuário
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@email.com",
    "password": "senha123",
    "full_name": "Nome Completo",
    "phone": "(11) 99999-9999",
    "cpf": "123.456.789-01",
    "user_type": "patient"
  }'
```

#### Buscar Profissionais
```bash
curl "http://localhost:3001/api/professionals/search?specialty=Psicologia&max_price=150"
```

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@email.com",
    "password": "senha123"
  }'
```

## 🚀 Deploy

### Deploy Tradicional

1. **Prepare o servidor**
```bash
# Execute o script de deploy
./scripts/deploy.sh
```

2. **Configure o Nginx**
```bash
# Copie a configuração
sudo cp config/nginx.conf /etc/nginx/sites-available/mentecare-backend
sudo ln -s /etc/nginx/sites-available/mentecare-backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

3. **Configure SSL**
```bash
sudo certbot --nginx -d api.seudominio.com
```

### Deploy com Docker

```bash
# Build e start
docker-compose up -d

# Verificar status
docker-compose ps

# Logs
docker-compose logs -f mentecare-backend
```

### DigitalOcean

Consulte o [Guia de Deploy DigitalOcean](../guia_deploy_digitalocean_nodejs.md) para instruções detalhadas.

## 📊 Estrutura do Projeto

```
mentecare-backend-nodejs/
├── config/
│   ├── database.js          # Configuração do banco
│   ├── jwt.js              # Configuração JWT
│   └── nginx.conf          # Configuração Nginx
├── controllers/
│   ├── authController.js   # Controlador de autenticação
│   ├── userController.js   # Controlador de usuários
│   └── professionalController.js # Controlador de profissionais
├── middleware/
│   ├── auth.js            # Middleware de autenticação
│   └── validation.js      # Middleware de validação
├── models/
│   ├── index.js          # Configuração dos modelos
│   ├── User.js           # Modelo de usuário
│   └── Professional.js   # Modelo de profissional
├── routes/
│   ├── auth.js           # Rotas de autenticação
│   ├── users.js          # Rotas de usuários
│   └── professionals.js  # Rotas de profissionais
├── scripts/
│   └── deploy.sh         # Script de deploy
├── utils/
│   └── seedDatabase.js   # Script para popular banco
├── .env.example          # Exemplo de variáveis de ambiente
├── .env.production       # Configurações de produção
├── docker-compose.yml    # Configuração Docker
├── Dockerfile           # Imagem Docker
├── ecosystem.config.js  # Configuração PM2
├── package.json         # Dependências e scripts
└── server.js           # Arquivo principal
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch

# Testes de integração
npm run test:integration
```

## 📈 Monitoramento

### PM2 Monitoring
```bash
# Status dos processos
pm2 status

# Monitoramento em tempo real
pm2 monit

# Logs em tempo real
pm2 logs mentecare-backend

# Restart da aplicação
pm2 restart mentecare-backend
```

### Health Checks
```bash
# Verificar saúde da aplicação
curl http://localhost:3001/api/health

# Verificar métricas
curl http://localhost:9090/metrics
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Aplicação
NODE_ENV=production
PORT=3000

# Banco de Dados
DATABASE_PATH=./database/mentecare_production.db

# JWT
JWT_SECRET=sua_chave_super_segura
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://seudominio.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia aplicação em produção |
| `npm run dev` | Inicia em modo desenvolvimento |
| `npm test` | Executa testes |
| `npm run lint` | Verifica código com ESLint |
| `npm run db:sync` | Sincroniza banco de dados |
| `npm run db:seed` | Popula banco com dados iniciais |

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use ESLint para manter consistência
- Escreva testes para novas funcionalidades
- Documente APIs com comentários JSDoc
- Siga convenções de commit semântico

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email:** suporte@mentecare.com
- **Documentação:** https://docs.mentecare.com
- **Issues:** https://github.com/mentecare/backend-nodejs/issues

## 🙏 Agradecimentos

- Equipe de desenvolvimento MenteCare
- Comunidade Node.js
- Contribuidores do projeto

---

**Desenvolvido com ❤️ pela equipe MenteCare**

