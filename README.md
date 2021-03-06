# Docker registry UI

![Version](https://img.shields.io/badge/version-0.0.5-green.svg)
![Stars](https://img.shields.io/docker/stars/dmitriym09/docker-registry-ui.svg)
![Pulls](https://img.shields.io/docker/pulls/dmitriym09/docker-registry-ui.svg)

This is a [svelte](https://svelte.dev) web ui for private [docker registry](https://hub.docker.com/_/registry). Using Docker Registry HTTP API [V2](https://docs.docker.com/registry/spec/api/).

Supported functions:
- list docker images;
- load docker images from tar-archive;
- save docker images to tar-archive.

## Using

Run with [docker registry](https://hub.docker.com/_/registry):

```bash
docker-compose up -d
```

## Dev

Run in dev mode:

```bash
npm ci
docker-compose -f docker-compose.dev.yml up -d registry
npm run dev
```

Build prod and push in docker hub:

```bash
npm run docker
```

## versions

- **0.0.1** - init
- **0.0.2**
- **0.0.3** - add rmi, tag sort
- **0.0.4** - fix parese load
- **0.0.5** - fix blocker position
