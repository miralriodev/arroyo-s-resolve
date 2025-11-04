## Multi-stage build para PWA React (Vite)

# Etapa de construcción
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar dependencias con cache eficiente
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copiar el resto del código y construir
COPY . .
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine AS production

# Eliminar la configuración por defecto para evitar conflictos
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiar la build estática
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx para SPA (redirección a index.html)
COPY nginx.conf /etc/nginx/conf.d/nginx.conf

EXPOSE 80

# Ejecutar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]