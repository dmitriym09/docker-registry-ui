'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const multer = require('multer');
const upload = multer();

const {
    catalog,
    manifests,
    save,
    load
} = require('./api/docker-registry');

module.exports = (app) => {
    app.get('/api/catalog', async (req, res) => {
        try {
            return res.json(await catalog());
        } catch (err) {
            console.warn(err);
            return res.status(500).end();
        }
    });

    app.get('/api/manifests', async (req, res) => {
        if(!!!req.query.repo) {
            return res.status(400).send('Not set query params repo');
        }

        if(!!!req.query.tag) {
            return res.status(400).send('Not set query params tag');
        }

        try {
            return res.json(await manifests(req.query.repo, req.query.tag));
        } catch (err) {
            console.warn(err);
            return res.status(500).end();
        }
    });

    app.get('/api/save', async (req, res) => {
        if(!!!req.query.repo) {
            return res.status(400).send('Not set query params repo');
        }

        if(!!!req.query.tag) {
            return res.status(400).send('Not set query params tag');
        }

        try {
            return res.json(await save(req.query.repo, req.query.tag, res));
        } catch (err) {
            console.warn(err);
            return res.status(500).end();
        }
    });

    app.post('/api/load', upload.any(), async (req, res) => {
        try {
            const tmpPath = path.join(os.tmpdir(), `${Math.random()}-${Date.now()}.tar`);
            const file = req.files[0];

            await fs.promises.writeFile(tmpPath, file.buffer);
            await load(tmpPath);
            await fs.promises.unlink(tmpPath);
        } catch (err) {
            console.warn(err);
            return res.status(500).end();
        }

		/*if (dstRel.includes('..')) {
			console.error(`Error dst`, dstRel);
			return res.status(400).send('Error dst');
		}

		if (!!!file) {
			console.error(`Not set file`, file);
			return res.status(400).send('Not set file');
		}

		const dst = path.normalize(path.join('static', dstRel));
		let dn = path.dirname(dst);

		const write = () => {
			fs.exists(dst, (exist) => {
				if (exist && !!!rewrite) {
					console.error(`${dstRel} already exist`, rewrite);
					return res.status(500).send(`${dstRel} already exist`);
				}

				if(exist) {
					fs.chmodSync(dst, 0o664);
				}

				fs.writeFile(dst, file.buffer, {
					mode: 0o444,
					flag: !!rewrite ? 'w' : 'wx'
				}, (err) => {
					if (!!err) {
						console.error(err);
						return res.status(500).send('Error write file');
					}

					console.log('Write file', dst);

					if(dstRel[0] != '/') {
						dstRel = `/${dstRel}`;
					}
					res.status(201).json({fp: dstRel});
				});
			});
		}

		fs.exists(dn, (exist) => {
			if (!exist) {
				if (!!!mkdir) {
					return res.status(500).send(`Dir '${dstRel}' not exist`);
				}
				fs.mkdir(dn, {
					recursive: true
				}, (err) => {
					if (!!err) {
						console.error(err);
						return res.status(500).send(`Error create dir '${dstRel}'`);
					}

					write();
				});
			} else {
				write();
			}*/
        res.status(201).end();
    });
};