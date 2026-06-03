FROM node:24-alpine AS build

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build


# ---------- Nginx ----------
FROM nginx:alpine

RUN apk add --no-cache apache2-utils

COPY --from=build /app/dist/hoozit/browser /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx/entrypoint.sh /docker-entrypoint.d/40-configure-basic-auth.sh

RUN chmod +x /docker-entrypoint.d/40-configure-basic-auth.sh

EXPOSE 80
