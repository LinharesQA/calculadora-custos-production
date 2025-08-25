# Dockerfile para calculadora de custos
FROM node:18-alpine AS builder

# Definir diretorio de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar codigo fonte
COPY . .

# Fazer build da aplicacao
RUN npm run build

# Estagio de producao com nginx
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuracao customizada do nginx (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
