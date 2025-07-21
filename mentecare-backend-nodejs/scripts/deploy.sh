#!/bin/bash

# Script de Deploy - MenteCare Backend Node.js
# Para uso na DigitalOcean ou outros servidores Linux

set -e

echo "🚀 Iniciando deploy do MenteCare Backend Node.js..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then
    log_error "Não execute este script como root!"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js não está instalado!"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    log_error "npm não está instalado!"
    exit 1
fi

# Verificar PM2
if ! command -v pm2 &> /dev/null; then
    log_warn "PM2 não está instalado. Instalando..."
    npm install -g pm2
fi

# Criar diretórios necessários
log_info "Criando diretórios necessários..."
mkdir -p logs
mkdir -p database
mkdir -p uploads

# Instalar dependências
log_info "Instalando dependências..."
npm ci --only=production

# Copiar arquivo de ambiente para produção
if [ ! -f .env ]; then
    log_info "Copiando arquivo de ambiente para produção..."
    cp .env.production .env
    log_warn "IMPORTANTE: Edite o arquivo .env com suas configurações específicas!"
fi

# Executar migrações do banco (se necessário)
log_info "Sincronizando banco de dados..."
NODE_ENV=production node -e "
const { syncDatabase } = require('./config/database');
syncDatabase().then(() => {
    console.log('✅ Banco sincronizado com sucesso');
    process.exit(0);
}).catch(err => {
    console.error('❌ Erro ao sincronizar banco:', err);
    process.exit(1);
});
"

# Popular banco com dados iniciais (se necessário)
if [ -f "utils/seedDatabase.js" ]; then
    log_info "Populando banco com dados iniciais..."
    NODE_ENV=production node utils/seedDatabase.js
fi

# Parar PM2 se estiver rodando
log_info "Parando instâncias anteriores..."
pm2 stop mentecare-backend 2>/dev/null || true
pm2 delete mentecare-backend 2>/dev/null || true

# Iniciar aplicação com PM2
log_info "Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js --env production

# Salvar configuração PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup

# Verificar status
log_info "Verificando status da aplicação..."
sleep 5
pm2 status

# Teste de health check
log_info "Testando health check..."
sleep 2
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    log_info "✅ Health check passou! Aplicação está rodando."
else
    log_error "❌ Health check falhou! Verifique os logs."
    pm2 logs mentecare-backend --lines 20
    exit 1
fi

# Configurar nginx (se disponível)
if command -v nginx &> /dev/null; then
    log_info "Nginx detectado. Configuração manual necessária."
    log_warn "Configure o nginx para fazer proxy reverso para localhost:3000"
fi

# Configurar firewall (se ufw disponível)
if command -v ufw &> /dev/null; then
    log_info "Configurando firewall..."
    sudo ufw allow 3000/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 22/tcp
fi

log_info "🎉 Deploy concluído com sucesso!"
log_info "📡 Aplicação rodando em: http://localhost:3000"
log_info "📊 Monitoramento PM2: pm2 monit"
log_info "📋 Logs: pm2 logs mentecare-backend"

echo ""
echo "📝 Próximos passos:"
echo "1. Configure o nginx como proxy reverso"
echo "2. Configure SSL/TLS com Let's Encrypt"
echo "3. Configure backup automático do banco"
echo "4. Configure monitoramento e alertas"
echo "5. Teste todas as funcionalidades"

