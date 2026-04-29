# ============================================
# FRONTEND BANK - DOCKERFILE
# Multi-stage build con Alpine Linux + No Root
# ============================================

# --------------------------------------------
# STAGE 1: Build
# Base: Node.js 18 Alpine (LTS)
# --------------------------------------------
FROM node:18-alpine AS builder

# Información del mantenedor
LABEL maintainer="Frontend Bank Team" \
      description="Angular 17 Frontend Application" \
      version="1.0.0"

# Variables de entorno para el build
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false \
    CI=true

# Directorio de trabajo
WORKDIR /app

# Copiar solo los archivos necesarios para instalar dependencias
# Esto permite cachear el layer de node_modules
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

# Instalar dependencias
# --ci usa package-lock.json para instalaciones determinísticas
# --only=production instala solo dependencias de producción
# --no-audit y --no-fund acelera la instalación
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copiar el resto del código fuente
COPY . .

# Crear directorio de build con permisos correctos
RUN mkdir -p /app/dist && chown -R node:node /app

# Cambiar a usuario no-root para el build (por seguridad)
USER node

# Build de producción
RUN npm run build:prod

# --------------------------------------------
# STAGE 2: Production
# Base: Nginx Alpine (servidor web ligero)
# --------------------------------------------
FROM nginx:alpine-slim AS production

# Información del mantenedor
LABEL maintainer="Frontend Bank Team" \
      description="Angular 17 Frontend - Production" \
      version="1.0.0"

# Crear usuario no-root para nginx
# uid 1000 es convención para usuarios de aplicación
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup && \
    mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# Copiar configuración personalizada de nginx
COPY --chown=appuser:appgroup nginx.conf /etc/nginx/nginx.conf
COPY --chown=appuser:appgroup default.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos de build desde el stage anterior
COPY --chown=appuser:appgroup --from=builder /app/dist/frontend-bank/browser /usr/share/nginx/html

# Eliminar archivos innecesarios de nginx por defecto
RUN rm -f /usr/share/nginx/html/index.html 2>/dev/null || true && \
    rm -rf /docker-entrypoint.d

# Variables de entorno para nginx
ENV NGINX_WORKER_PROCESSES=auto \
    NGINX_WORKER_CONNECTIONS=1024 \
    NGINX_KEEPALIVE_TIMEOUT=65

# Exponer puerto no-root (1024+)
EXPOSE 8080

# Cambiar a usuario no-root
USER appuser:appgroup

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Comando para iniciar nginx en foreground
CMD ["nginx", "-g", "daemon off;"]

# ============================================
# STAGE 3: Development (Opcional)
# Para desarrollo local con hot reload
# --------------------------------------------
FROM node:18-alpine AS development

ENV NODE_ENV=development \
    NPM_CONFIG_LOGLEVEL=info \
    CHOKIDAR_USEPOLLING=true

WORKDIR /app

# Instalar dependencias de desarrollo
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Crear usuario no-root
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser:appgroup

EXPOSE 4200

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]
