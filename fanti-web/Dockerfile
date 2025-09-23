# Dockerfile for Next.js app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS runner

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["npm", "start"]

# # Imagem base
# FROM node:18-alpine

# WORKDIR /app

# # Instala dependências
# COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
# RUN npm install

# # Copia o restante do código (apenas para instalar dependências)
# COPY . .

# # Exponha a porta do Next.js
# EXPOSE 3000

# # Comando para desenvolvimento (hot reload)
# CMD ["npm", "run", "dev"]
