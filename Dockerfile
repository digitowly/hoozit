FROM node:26-alpine AS build

RUN npm install -g pnpm@10.4.1

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

RUN mkdir -p /etc/nginx/includes \
  && touch /etc/nginx/includes/basic-auth.conf /etc/nginx/.htpasswd /var/run/nginx.pid \
  && chown -R nginx:nginx /etc/nginx/includes /etc/nginx/.htpasswd /var/cache/nginx /var/run/nginx.pid \
  && chmod +x /docker-entrypoint.d/40-configure-basic-auth.sh

USER nginx

EXPOSE 8080
