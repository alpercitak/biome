FROM oven/bun:latest AS builder
WORKDIR /app

COPY ui/package.json ui/bun.lock ./
RUN bun install

COPY ui/ ./
RUN bun run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ui/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]