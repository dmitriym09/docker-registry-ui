'use strict';

const {
    spawn
} = require('child_process');

const fs = require('fs');
const path = require('path');

const fetch = require('node-fetch');

const REGISTRY = process.env.REGISTRY || 'localhost:5000';
const HTTPS = 'HTTPS' in process.env;

const dateFormat = require('date-format');

const lockFile = require('lockfile');

const etcDocker = '/etc/docker';

if (!!!HTTPS && REGISTRY !== 'localhost:5000') {
    let val = {
        'insecure-registries': [REGISTRY]
    };
    if (!fs.existsSync(etcDocker)) {
        fs.mkdirSync(etcDocker);
    }
    const daemonFile = path.join(etcDocker, 'daemon.json');
    if (fs.existsSync(daemonFile)) {
        val = JSON.parse(fs.readFileSync(daemonFile, 'utf8'));
        if (!!!val['insecure-registries']) {
            val['insecure-registries'] = [];
        }

        val['insecure-registries'].push(REGISTRY);
    }

    fs.writeFileSync(daemonFile, JSON.stringify(val), 'utf-8');
}

const lock = name => new Promise((resolve, reject) => {
    name = name.replace(/[\\/]/g, '');
    lockFile.lock(`${name}.lock`, {}, (err) => {
        if (!!err) {
            return reject(err);
        }

        resolve();
    });
});

const unlock = name => new Promise((resolve, reject) => {
    name = name.replace(/[\\/]/g, '');
    lockFile.unlock(`${name}.lock`, (err) => {
        if (!!err) {
            return reject(err);
        }

        resolve();
    });
});

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
                        acm[key].created = dateFormat.parse(dateFormat.ISO8601_FORMAT, acm[key].created).valueOf();
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
        lock(name)
            .then(() => execute('docker', ['pull', name]))
            .then((res) => {
                console.log('pull', name, res.code, `stdout: '${res.stdout}', stderr: '${res.stderr}'`);
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

                return execute('docker', ['rmi', name]);
            })
            .then((res) => {
                console.log('rmi', name, res.code, `stdout: '${res.stdout}', stderr: '${res.stderr}'`);

                if (res.code != 0) {
                    console.warn('Error rmi', res.err || res.stderr || res.stdout);
                }

                return Promise.resolve();
            })
            .then(() => unlock(name))
            .then(resolve)
            .catch((err) => {
                unlock(name)
                    .finally(() => {
                        reject(err)
                    });
            });
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
                console.log('load', imgPath, res.code, `stdout: '${res.stdout}', stderr: '${res.stderr}'`);
                if (res.code != 0) {
                    throw new Error(res.err || res.stderr || res.stdout);
                }

                imageName = res
                    .stdout
                    .split('\n')[0]
                    .replace(/^Loaded image: /, '')
                    .trim();

                const [repo, tag] = (imageName.split('/')[1] || imageName).split(':');

                tagName = `${REGISTRY}/${repo}:${tag}`;

                return lock(tagName);
            })
            .then(() => execute('docker', ['tag', imageName, tagName]))
            .then((res) => {
                console.log('tag', imageName, tagName, res.code, `stdout: '${res.stdout}', stderr: '${res.stderr}'`);

                if (res.code != 0) {
                    throw new Error(res.err || res.stderr || res.stdout);
                }

                return execute('docker', ['push', tagName]);
            })
            .then((res) => {
                console.log('push', tagName, res.code, `stdout: '${res.stdout}', stderr: '${res.stderr}'`);

                if (res.code != 0) {
                    throw new Error(res.err || res.stderr || res.stdout);
                }
                return execute('docker', ['rmi', tagName]);
            })
            .then((res) => {
                console.log('rmi', tagName, res.code, `stdout: '${res.stdout}', stderr: '${res.stderr}'`);
                if (res.code != 0) {
                    console.warn('Error rmi', res.err || res.stderr || res.stdout);
                }

                return execute('docker', ['rmi', imageName]);
            })
            .then((res) => {
                console.log('rmi', imageName, res.code, `stdout: '${res.stdout}', stderr: '${res.stderr}'`);
                if (res.code != 0) {
                    console.warn('Error rmi', res.err || res.stderr || res.stdout);
                }

                return Promise.resolve();
            })
            .then(() => unlock(tagName))
            .then(resolve)
            .catch((err) => {
                unlock(tagName)
                    .finally(() => {
                        reject(err)
                    });
            });
    });
}