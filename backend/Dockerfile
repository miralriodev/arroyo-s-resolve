FROM node:20

WORKDIR /app

# 1. Copia el package.json
COPY package*.json ./

# 2. Instala TODAS las dependencias (incluyendo devDeps como 'prisma')
RUN npm install

# 3. Copia tu esquema de Prisma
# (Asumiendo que está en backend/prisma/schema.prisma)
COPY ./prisma ./prisma

# 4. ¡EL PASO CLAVE! Genera el cliente de Prisma
RUN npx prisma generate

# 5. Copia el resto de tu código fuente
COPY . .

# (Opcional pero recomendado para producción)
# Elimina las devDependencies que ya no necesitamos
RUN npm prune --production

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]