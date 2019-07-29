'use strict';

const REGISTRY = process.env.REGISTRY || 'localhost:5000';
const HTTPS = 'HTTPS' in process.env;

const fetch = require('node-fetch');

const {
    spawn
} = require('child_process');

const execute = (cmd, attrs, onStdOut = null) => {
    return new Promise((resolve, reject) => {
        const proc = spawn(cmd, attrs);
        let stderr = [];
        let stdout = [];
        let err = null;
        proc.stdout.on('data', (data) => {
            if (onStdOut) {
                onStdOut(data);
            } else {
                stdout.push(data);
            }
        });

        proc.stderr.on('data', (data) => {
            stderr.push(data);
        });

        proc.on('error', (e) => {
            err = e;
        });

        proc.on('close', (code) => {
            console.log(`${cmd} exited with code ${code}`);
            if (!!err) {
                return reject({
                    stderr: Buffer.concat(stderr).toString(),
                    stdout: Buffer.concat(stdout).toString(),
                    code: code,
                    err: err
                });
            }

            return resolve({
                stderr: Buffer.concat(stderr).toString(),
                stdout: Buffer.concat(stdout).toString(),
                code: code,
            });
        });
    });
};

module.exports.catalog = () => {
    return new Promise((resolve, reject) => {
        fetch(`http${HTTPS ? 's' : ''}://${REGISTRY}/v2/_catalog`)
            .then((res) => {
                if (res.status != 200) {
                    throw new Error(res.status);
                }
                return res.json();
            })
            .then((catalog) => {
                return Promise.all(catalog.repositories.map((repoName) => {
                    return fetch(`http${HTTPS ? 's' : ''}://${REGISTRY}/v2/${repoName}/tags/list`);
                }));
            })
            .then((resultes) => {
                return Promise.all(resultes.map((res) => {
                    return res.json();
                }));
            })
            .then((tags) => {
                resolve(tags.reduce((acm, repo) => {
                    acm[repo.name] = repo.tags;
                    return acm;
                }, {}));
            })
            .catch(reject);
    });
};

module.exports.manifests = (repoName, tag) => {
    return new Promise((resolve, reject) => {
        fetch(`http${HTTPS ? 's' : ''}://${REGISTRY}/v2/${repoName}/manifests/${tag}`)
            .then((res) => {
                if (res.status != 200) {
                    throw new Error(res.status);
                }
                return res.json();
            })
            .then((manifest) => {
                manifest.history = manifest.history.map((hist) => {
                    return Object.keys(hist).reduce((acm, key) => {
                        acm[key] = JSON.parse(hist[key]);

                        return acm;
                    }, {});
                });
                resolve(manifest);
            })
            .catch(reject);
    });
};

module.exports.save = (repoName, tag, response) => {
    const name = `${REGISTRY}/${repoName}:${tag}`;
    return new Promise((resolve, reject) => {
        execute('docker', ['pull', name])
            .then((res) => {
                if (res.code != 0) {
                    throw new Error(res.err || res.stderr || res.stdout);
                }

                response.set('Content-Type', 'application/tar');
                response.set('Content-Disposition', `attachment; filename=${repoName}_${tag}.tar`);

                return execute('docker',
                    ['save', name],
                    (data) => {
                        response.write(data);
                    });
            })
            .then(() => {
                response.end();

                //TODO:  return execute('docker', ['rmi', name]);
                return Promise.resolve();
            })
            .then((res) => {
                resolve();
            })
            .catch(reject);
    });
}

module.exports.load = (imgPath) => {
    let imageName = null;
    let repo = null;
    let tag = null;
    let tagName = null;

    return new Promise((resolve, reject) => {
        execute('docker', ['load', '-i', imgPath])
            .then((res) => {
                if (res.code != 0) {
                    throw new Error(res.err || res.stderr || res.stdout);
                }

                imageName = res
                    .stdout
                    .replace(/^Loaded image: /, '')
                    .trim();

                [repo, tag] = imageName
                    .split('/')[1]
                    .split(':');


                tagName = `${REGISTRY}/${repo}:${tag}`;
                return execute('docker', ['tag', imageName, tagName]);
            })
            .then((res) => {
                if (res.code != 0) {
                    throw new Error(res.err || res.stderr || res.stdout);
                }

                return execute('docker', ['push', tagName]);
            })
            .then((res) => {
                if (res.code != 0) {
                    throw new Error(res.err || res.stderr || res.stdout);
                }

                resolve();
            })
            .catch(reject);
    });
}