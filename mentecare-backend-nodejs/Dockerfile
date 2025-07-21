# Dockerfile para MenteCare Backend Node.js
FROM node:18-alpine

# Metadados
LABEL maintainer="MenteCare Team"
LABEL description="Backend Node.js para aplicação de telemedicina MenteCare"
LABEL version="1.0.0"

# Instalar dependências do sistema
RUN apk add --no-cache \
    sqlite \
    curl \
    && rm -rf /var/cache/apk/*

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mentecare -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p logs database uploads && \
    chown -R mentecare:nodejs /app

# Mudar para usuário não-root
USER mentecare

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Comando padrão
CMD ["node", "server.js"]

