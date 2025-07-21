# Guia de Deploy - MenteCare Backend Node.js na DigitalOcean

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Servidor](#configuração-do-servidor)
3. [Deploy da Aplicação](#deploy-da-aplicação)
4. [Configuração do Nginx](#configuração-do-nginx)
5. [SSL/TLS com Let's Encrypt](#ssltls-com-lets-encrypt)
6. [Monitoramento e Logs](#monitoramento-e-logs)
7. [Backup e Manutenção](#backup-e-manutenção)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Pré-requisitos

### Servidor DigitalOcean
- **Droplet:** Ubuntu 22.04 LTS
- **Tamanho mínimo:** 1GB RAM, 1 vCPU (Basic $6/mês)
- **Recomendado:** 2GB RAM, 1 vCPU (Basic $12/mês)
- **Armazenamento:** 25GB SSD mínimo

### Domínio
- Domínio registrado e configurado
- DNS apontando para o IP do servidor
- Subdomínio para API (ex: api.mentecare.com)

### Conhecimentos Necessários
- Comandos básicos de Linux
- SSH e terminal
- Conceitos de proxy reverso
- Básico de nginx

---

## 🖥️ Configuração do Servidor

### 1. Acesso Inicial ao Servidor

```bash
# Conectar via SSH
ssh root@your-server-ip

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências básicas
apt install -y curl wget git ufw fail2ban
```

### 2. Criar Usuário Não-Root

```bash
# Criar usuário
adduser mentecare

# Adicionar ao grupo sudo
usermod -aG sudo mentecare

# Configurar SSH para o novo usuário
mkdir -p /home/mentecare/.ssh
cp ~/.ssh/authorized_keys /home/mentecare/.ssh/
chown -R mentecare:mentecare /home/mentecare/.ssh
chmod 700 /home/mentecare/.ssh
chmod 600 /home/mentecare/.ssh/authorized_keys
```

### 3. Configurar Firewall

```bash
# Configurar UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Verificar status
ufw status
```

### 4. Instalar Node.js

```bash
# Mudar para usuário mentecare
su - mentecare

# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar PM2 globalmente
sudo npm install -g pm2
```

### 5. Instalar e Configurar Nginx

```bash
# Instalar nginx
sudo apt install -y nginx

# Iniciar e habilitar nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

---

## 🚀 Deploy da Aplicação

### 1. Clonar Repositório

```bash
# Navegar para diretório home
cd /home/mentecare

# Clonar repositório (substitua pela URL do seu repo)
git clone https://github.com/seu-usuario/mentecare-backend-nodejs.git
cd mentecare-backend-nodejs

# Ou fazer upload via SCP/SFTP se não usar Git
```

### 2. Configurar Ambiente

```bash
# Copiar arquivo de ambiente
cp .env.production .env

# Editar configurações (IMPORTANTE!)
nano .env
```

**Configurações importantes no .env:**

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=sua_chave_jwt_super_segura_aqui
CORS_ORIGIN=https://seu-dominio.com
DATABASE_PATH=./database/mentecare_production.db
```

### 3. Executar Deploy

```bash
# Tornar script executável
chmod +x scripts/deploy.sh

# Executar deploy
./scripts/deploy.sh
```

### 4. Verificar Deploy

```bash
# Verificar status PM2
pm2 status

# Verificar logs
pm2 logs mentecare-backend

# Testar API
curl http://localhost:3000/api/health
```

---

## 🌐 Configuração do Nginx

### 1. Configurar Site

```bash
# Remover configuração padrão
sudo rm /etc/nginx/sites-enabled/default

# Copiar configuração do MenteCare
sudo cp config/nginx.conf /etc/nginx/sites-available/mentecare-backend

# Editar configuração
sudo nano /etc/nginx/sites-available/mentecare-backend
```

**Editar as seguintes linhas:**

```nginx
server_name api.mentecare.com;  # Seu domínio
```

### 2. Ativar Site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/mentecare-backend /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar nginx
sudo systemctl reload nginx
```

### 3. Verificar Funcionamento

```bash
# Testar via nginx
curl http://api.mentecare.com/api/health

# Verificar logs do nginx
sudo tail -f /var/log/nginx/mentecare-backend.access.log
```

---

## 🔒 SSL/TLS com Let's Encrypt

### 1. Instalar Certbot

```bash
# Instalar certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d api.mentecare.com

# Verificar renovação automática
sudo certbot renew --dry-run
```

### 2. Configurar Renovação Automática

```bash
# Editar crontab
sudo crontab -e

# Adicionar linha para renovação automática
0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Verificar HTTPS

```bash
# Testar HTTPS
curl https://api.mentecare.com/api/health

# Verificar certificado
openssl s_client -connect api.mentecare.com:443 -servername api.mentecare.com
```

---

## 📊 Monitoramento e Logs

### 1. Configurar PM2 Monitoring

```bash
# Instalar PM2 monitoring
pm2 install pm2-logrotate

# Configurar rotação de logs
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true

# Monitoramento em tempo real
pm2 monit
```

### 2. Configurar Logs do Sistema

```bash
# Configurar logrotate para nginx
sudo nano /etc/logrotate.d/nginx
```

### 3. Scripts de Monitoramento

```bash
# Criar script de health check
cat > /home/mentecare/health-check.sh << 'EOF'
#!/bin/bash
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "$(date): API health check failed" >> /var/log/mentecare-health.log
    pm2 restart mentecare-backend
fi
EOF

chmod +x /home/mentecare/health-check.sh

# Adicionar ao crontab
crontab -e
# Adicionar: */5 * * * * /home/mentecare/health-check.sh
```

---

## 💾 Backup e Manutenção

### 1. Script de Backup

```bash
# Criar script de backup
cat > /home/mentecare/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/mentecare/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco de dados
cp /home/mentecare/mentecare-backend-nodejs/database/mentecare_production.db \
   $BACKUP_DIR/database_$DATE.db

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz \
   /home/mentecare/mentecare-backend-nodejs/uploads/

# Backup da configuração
cp /home/mentecare/mentecare-backend-nodejs/.env \
   $BACKUP_DIR/env_$DATE.backup

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete

echo "$(date): Backup completed" >> /var/log/mentecare-backup.log
EOF

chmod +x /home/mentecare/backup.sh

# Agendar backup diário
crontab -e
# Adicionar: 0 2 * * * /home/mentecare/backup.sh
```

### 2. Atualizações

```bash
# Script de atualização
cat > /home/mentecare/update.sh << 'EOF'
#!/bin/bash
cd /home/mentecare/mentecare-backend-nodejs

# Backup antes da atualização
./backup.sh

# Atualizar código
git pull origin main

# Instalar dependências
npm ci --only=production

# Reiniciar aplicação
pm2 restart mentecare-backend

# Verificar saúde
sleep 10
curl -f http://localhost:3000/api/health || pm2 logs mentecare-backend
EOF

chmod +x /home/mentecare/update.sh
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Aplicação não inicia

```bash
# Verificar logs
pm2 logs mentecare-backend

# Verificar porta
sudo netstat -tlnp | grep :3000

# Verificar permissões
ls -la /home/mentecare/mentecare-backend-nodejs/

# Reiniciar aplicação
pm2 restart mentecare-backend
```

#### 2. Nginx retorna 502 Bad Gateway

```bash
# Verificar se aplicação está rodando
pm2 status

# Verificar logs do nginx
sudo tail -f /var/log/nginx/error.log

# Testar conexão direta
curl http://localhost:3000/api/health

# Verificar configuração nginx
sudo nginx -t
```

#### 3. SSL não funciona

```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew

# Verificar configuração nginx
sudo nginx -t && sudo systemctl reload nginx
```

#### 4. Banco de dados corrompido

```bash
# Restaurar backup
cp /home/mentecare/backups/database_YYYYMMDD_HHMMSS.db \
   /home/mentecare/mentecare-backend-nodejs/database/mentecare_production.db

# Reiniciar aplicação
pm2 restart mentecare-backend
```

### Comandos Úteis

```bash
# Status geral do sistema
sudo systemctl status nginx
pm2 status
df -h
free -h
top

# Logs em tempo real
pm2 logs mentecare-backend --lines 100
sudo tail -f /var/log/nginx/mentecare-backend.access.log

# Reiniciar serviços
pm2 restart mentecare-backend
sudo systemctl restart nginx

# Verificar conectividade
curl -I https://api.mentecare.com/api/health
nslookup api.mentecare.com
```

---

## 📈 Otimizações de Performance

### 1. Configurações do Sistema

```bash
# Aumentar limites de arquivo
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Otimizar TCP
echo "net.core.somaxconn = 65536" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 2. Configurações do PM2

```bash
# Usar todos os cores disponíveis
pm2 delete mentecare-backend
pm2 start ecosystem.config.js --env production
```

### 3. Cache no Nginx

Adicionar ao nginx.conf:

```nginx
# Cache para arquivos estáticos
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Cache para API responses (cuidado com dados dinâmicos)
location /api/professionals/specialties {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 1h;
}
```

---

## 🚀 Deploy com Docker (Alternativo)

### 1. Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Adicionar usuário ao grupo docker
sudo usermod -aG docker mentecare
```

### 2. Deploy com Docker

```bash
# Build e start
docker-compose up -d

# Verificar status
docker-compose ps

# Logs
docker-compose logs -f mentecare-backend
```

---

## 📞 Suporte e Contato

Para suporte técnico ou dúvidas sobre o deploy:

- **Email:** suporte@mentecare.com
- **Documentação:** https://docs.mentecare.com
- **Issues:** https://github.com/mentecare/backend-nodejs/issues

---

## 📝 Checklist de Deploy

- [ ] Servidor DigitalOcean configurado
- [ ] Usuário não-root criado
- [ ] Firewall configurado
- [ ] Node.js e PM2 instalados
- [ ] Nginx instalado e configurado
- [ ] Aplicação deployada com sucesso
- [ ] SSL/TLS configurado
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Health checks funcionando
- [ ] DNS configurado corretamente
- [ ] Testes de carga realizados
- [ ] Documentação atualizada

---

**Última atualização:** 19/07/2025  
**Versão do guia:** 1.0.0  
**Compatível com:** Ubuntu 22.04 LTS, Node.js 18+

