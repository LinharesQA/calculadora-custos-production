# Multi-stage Dockerfile para calculadora de custos fullstack
FROM node:18-alpine AS base

# Definir diretorio de trabalho
WORKDIR /app

# ============= FRONTEND BUILD =============
FROM base AS frontend-build

# Copiar arquivos do frontend
COPY package*.json ./
COPY *.html ./
COPY *.js ./
COPY *.json ./
COPY js/ ./js/
COPY src/ ./src/

# Frontend não precisa de build especial (arquivos estáticos)
RUN echo "Frontend: Arquivos estáticos prontos"

# ============= BACKEND BUILD =============
FROM base AS backend-build

# Copiar package.json dos dois projetos
COPY package*.json ./
COPY backend-auth/package*.json ./backend-auth/

# Instalar dependências
RUN npm ci --only=production
RUN cd backend-auth && npm ci --only=production

# Copiar código fonte do backend
COPY backend-auth/ ./backend-auth/

# ============= PRODUCTION =============
FROM node:18-alpine AS production

WORKDIR /app

# Instalar ferramentas necessárias
RUN apk add --no-cache curl

# Copiar aplicação buildada
COPY --from=backend-build /app ./

# Copiar frontend para servir estaticamente (opcional)
COPY --from=frontend-build /app/frontend ./frontend

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Ajustar permissões
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Comando de inicialização
CMD ["npm", "run", "start:production"]
# COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
