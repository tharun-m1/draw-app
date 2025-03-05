FROM node:22-alpine

WORKDIR /app


COPY ./pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY ./turbo.json ./turbo.json

COPY ./package.json ./package.json

COPY ./packages ./packages
COPY ./apps/ws-server ./apps/ws-server

RUN npm i -g pnpm
RUN pnpm install

RUN pnpm run generate:client
RUN pnpm run build

EXPOSE 8080

CMD [ "pnpm", "run", "start:ws-server" ]


