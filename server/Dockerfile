FROM node:18.17.1-alpine as base

ENV APPLICATION_ROOT=/var/app
ENV NODE_ENV=production
# IMAGE_TAG can be something like <env>-<ts>-<sha> created by GH workflows for example
ARG IMAGE_TAG
ENV IMAGE_TAG=${IMAGE_TAG}
# TODO: Add env variables for sentry or similar monitoring platform

FROM base as build

WORKDIR ${APPLICATION_ROOT}
COPY package*.json tsconfig*.json ./
COPY prisma ./prisma
# TODO get GITHUB_TOKEN ARG add create npmrc with it (for private repos access) and then remove it after npm ci
RUN npm ci --ignore-scripts
RUN npm rebuild
COPY src ./src
RUN npm run build
RUN npm prune --production

FROM base
WORKDIR ${APPLICATION_ROOT}
COPY package*.json tsconfig*.json ./
COPY --from=build ${APPLICATION_ROOT}/dist dist
COPY --from=build ${APPLICATION_ROOT}/node_modules node_modules
COPY --from=build ${APPLICATION_ROOT}/prisma prisma
# TODO: Upload assets to monitoring platform
RUN npx prisma generate
# Create and switch to a user called `runner` to avoid running the application as root.
RUN adduser --disabled-password --uid 10000 runner
USER 10000

CMD ["npm", "start"]
