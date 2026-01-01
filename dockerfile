# Etapa 1: Build de la app con Node.js
FROM node:18 AS build

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
COPY .env ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del proyecto
COPY . .

# Compilar SCSS
RUN npm run compile-sass

# Generar el build de producción
RUN npm run build

# Etapa 2: Servir build con Nginx
FROM nginx:latest

# Copiar build generado al contenedor de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Reemplazar configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# Comando para mantener Nginx corriendo
CMD ["nginx", "-g", "daemon off;"]