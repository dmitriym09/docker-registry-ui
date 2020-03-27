FROM docker:dind
LABEL maintainer="dmitriym.09.12.1989@gmail.com"

RUN apk add --update nodejs npm

WORKDIR /opt/docker-registry-ui

COPY . .

RUN npm ci --only=prod

ENTRYPOINT ["./run-node.sh"]
