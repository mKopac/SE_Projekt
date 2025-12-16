# ZÁKLAD – spoločné deps
FROM node:22-alpine AS deps

WORKDIR /app

# skopírujeme package*.json a nainštalujeme závislosti
COPY package*.json ./
RUN npm install

# ---------- DEV STAGE (HMR) ----------
FROM deps AS dev

WORKDIR /app

# skopírujeme zvyšok projektu
COPY . .

# dôležité pre Docker + Vite na Windows/Mac (watch cez polling)
ENV CHOKIDAR_USEPOLLING=true
ENV NODE_ENV=development

EXPOSE 5173

# Vite dev server s HMR, dostupný zvonku
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ---------- BUILD STAGE (PROD) ----------
FROM deps AS build

WORKDIR /app

COPY . .

RUN npm run build

# ---------- RUNTIME STAGE (Nginx – PROD) ----------
FROM nginx:alpine AS prod

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
