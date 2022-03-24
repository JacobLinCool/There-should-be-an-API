FROM node:lts

COPY package.json /package.json
COPY pnpm-lock.yaml /pnpm-lock.yaml
COPY /src /src

RUN npm i

CMD ["npm", "start"]
EXPOSE 3000
