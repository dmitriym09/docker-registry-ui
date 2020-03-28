import express from "express";

import * as sapper from '@sapper/server';
import sirv from 'sirv';

const {
	PORT,
	NODE_ENV,
	REGISTRY_HOST = 'localhost',
	REGISTRY_PORT = 5000
} = process.env;

const dev = NODE_ENV === 'development';

import proxy from './_proxy.mjs';

express()
	.use((req, _, next) => {
		req.REGISTRY_HOST = REGISTRY_HOST;
		req.REGISTRY_PORT = parseInt(REGISTRY_PORT);
		console.log(req.method, req.url);
		next();
	})
	.use(sirv('static', {
		dev
	}))
	.use(async (req, res, next) => {
		if(req.url.startsWith('/v2')) {
			return await proxy(req, res);
		}
		next();
	})
	.use(sapper.middleware())
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});