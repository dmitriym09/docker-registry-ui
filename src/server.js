import express from "express";

import * as sapper from '@sapper/server';
import sirv from 'sirv';

const {
	PORT,
	NODE_ENV
} = process.env;

const dev = NODE_ENV === 'development';

express()
	.use(sirv('static', {
		dev
	}))
	.use(sapper.middleware())
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});