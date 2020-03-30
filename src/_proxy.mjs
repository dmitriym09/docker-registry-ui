import http from 'http';

export default function (req, res) {
    return new Promise((resolve, reject) => {
        const startDt = Date.now();
        console.log(`Start requst to registry ${req.REGISTRY_HOST}:${req.REGISTRY_PORT}${req.url}`);
        const reqs = http.request({
            path: req.url,
            method: req.method,
            host: req.REGISTRY_HOST,
            port: req.REGISTRY_PORT,
            headers: req.headers
        }, resp => {
            res.status(resp.statusCode);
            Object.keys(resp.headers).forEach(key => res.set(key, resp.headers[key]));
            resp.pipe(res);

            resp.on('end', () => {
                console.error(`Finish requst to registry ${req.REGISTRY_HOST}:${req.REGISTRY_PORT}${req.url} ${resp.statusCode} / ${Date.now() - startDt} msec`);
                resolve();
            });
        });

        reqs.on('error', err => {
            console.error(`Error requst to registry ${req.REGISTRY_HOST}:${req.REGISTRY_PORT}${req.url}: ${err}`);
            reject(err)
        });

        req.pipe(reqs);
    });
};