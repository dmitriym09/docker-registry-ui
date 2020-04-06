import iso8601 from "iso8601";

export default async function (name, tag) {
    const response = await fetch(`/v2/${name}/manifests/${tag}`, {
        headers: {
            Accept: "application/vnd.docker.distribution.manifest.v1+json"
        }
    });
    if (response.status != 200) {
        throw new Error(`Error get manifests for ${name}:${tag}: ${response.status} / ${await response.text()}`);
    }

    const data = await response.json();
    data.history = data.history.map(o => {
        const res = {
            v1Compatibility: JSON.parse(o.v1Compatibility)
        };
        res.v1Compatibility.created = iso8601.fromIso8601(
            res.v1Compatibility.created
        );
        return res;
    });

    const requests = await Promise.all(
        data.fsLayers.map(layes =>
            fetch(`/v2/${name}/blobs/${layes.blobSum}`, {
                method: "HEAD"
            })
        )
    );
    requests.forEach(
        (request, index) => {
            data.fsLayers[index].size = parseInt(
                request.headers.get("Content-Length")
            );
            data.history[index].v1Compatibility.size = data.fsLayers[index].size;
            data.history[index].v1Compatibility.digest = data.fsLayers[index].blobSum;
        }
    );
    return data;
}