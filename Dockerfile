# syntax=docker/dockerfile:1.7
FROM --platform=$BUILDPLATFORM node:26-alpine AS build-stage
WORKDIR /app
ARG REACT_APP_BACKEND_BASE_URL

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 100000

COPY . .
RUN --mount=type=secret,id=react_app_map_apikey \
    REACT_APP_MAP_APIKEY="$(cat /run/secrets/react_app_map_apikey)" \
    REACT_APP_BACKEND_BASE_URL="$REACT_APP_BACKEND_BASE_URL" \
    yarn build

FROM --platform=$TARGETPLATFORM nginx:stable-alpine AS production-stage
WORKDIR /var/
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
