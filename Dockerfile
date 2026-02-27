FROM node:16.16.0 AS build-stage
WORKDIR /app
ARG REACT_APP_MAP_APIKEY
ARG REACT_APP_BACKEND_BASE_URL
ENV REACT_APP_MAP_APIKEY=$REACT_APP_MAP_APIKEY
ENV REACT_APP_BACKEND_BASE_URL=$REACT_APP_BACKEND_BASE_URL
COPY . .
RUN yarn --network-timeout 100000
RUN yarn build

FROM nginx:stable-alpine AS production-stage
WORKDIR /var/
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
