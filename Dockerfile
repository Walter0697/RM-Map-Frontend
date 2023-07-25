FROM node:16.16.0 AS build-stage
WORKDIR /app

COPY package*.json ./
RUN yarn --network-timeout 100000

COPY . .
RUN yarn build

FROM nginx:stable-alpine AS production-stage
WORKDIR /var/
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]