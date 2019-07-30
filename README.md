# Docker registry UI

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
