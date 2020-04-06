<script>
  import { isBlocked, imgs } from "../stores.mjs";

  import DockerImg from "./DockerImg.svelte";

  /* 
  import { dispatch } from "../helpers/eventbus.js";

  export let catalogs = [];
  export let tags = {};
  export let table = null;

  const selectedFromUrl = new Set(new URL(location).searchParams.getAll("row"));

  let cntRows = 0;
  const createRow = (row, a, b) => {
    row.setAttribute("data-pos", cntRows++);
  };

  let lastClickedRow = null;
  const onRowClicked = event => {
    let tr = null;
    for (const el of event.path) {
      if (el.tagName == "TR") {
        tr = el;
        break;
      }
    }

    if (!!!tr) {
      return console.warn("Not found clicked row", event);
    }

    if (event.ctrlKey) {
      tr.classList.toggle("active");
    } else if (event.shiftKey) {
      if (!!!lastClickedRow) {
        tr.classList.toggle("active");
      } else if (!tr.classList.contains("active")) {
        const lastPos = parseInt(lastClickedRow.getAttribute("data-pos"));
        const curPos = parseInt(tr.getAttribute("data-pos"));
        for (
          let pos = Math.min(lastPos, curPos);
          pos <= Math.max(lastPos, curPos);
          ++pos
        ) {
          table.querySelector(`tr[data-pos="${pos}"]`).classList.add("active");
        }
      }
    } else {
      if (!tr.classList.contains("active")) {
        for (const el of table.querySelectorAll("tr.active")) {
          el.classList.remove("active");
        }
      }
      tr.classList.toggle("active");
    }

    lastClickedRow = tr.classList.contains("active") ? tr : null;
  };

  let isCatalogFetch = false;

  const refresh = () => {
    if (isCatalogFetch) {
      return;
    }

    isCatalogFetch = true;

    isBlocked.set(true);

    let _tags = null;
    let _catalogs = null;

    fetch("/api/catalog")
      .then(res => {
        if (res.status != 200) {
          throw new Error(res.status);
        }
        return res.json();
      })
      .then(data => {
        _catalogs = Object.keys(data).sort();
        _tags = _catalogs.reduce((acm, key) => {
          acm[key] = data[key].sort();
          return acm;
        }, {});

        return Promise.all(
          _catalogs.reduce((acm, catalog) => {
            acm.push(
              ..._tags[catalog].map(tag =>
                fetch(`/api/manifests?repo=${catalog}&tag=${tag}`)
              )
            );
            return acm;
          }, [])
        );
      })
      .then(responses => {
        return Promise.all(
          responses.map(res => {
            if (res.status != 200) {
              throw new Error(res.status);
            }
            return res.json();
          })
        );
      })
      .then(manifests => {
        for (const manifest of manifests) {
          const tmp = _tags[manifest.name];
          const pos = tmp.findIndex(tag => tag == manifest.tag);
          tmp[pos] = manifest;
        }

        return Promise.resolve();
      })
      .then(() => {
        for (const name in _tags) {
          _tags[name].sort(
            (l, r) => l.history[0].v1Compatibility.created - r.history[0].v1Compatibility.created
          );
        }
        catalogs = _catalogs;
        tags = _tags;
      })
      .catch(err => {
        console.warn(err);
        alert("Error get images");
      })
      .finally(() => {
        selectedFromUrl.clear();
        isCatalogFetch = false;
        isBlocked.set(false);
        dispatch("dockerimgs:refreshed");
      });
  };

  refresh();*/
</script>

<style>
  table {
    border-collapse: collapse;
  }
  table :global(tr) {
    border-bottom: 1px solid lightgray;
  }
  table :global(tbody:last-child tr:last-child) {
    border-bottom: none;
  }

  th {
    text-align: left;
    vertical-align: middle;
    padding-bottom: 0.5rem;
  }
  table :global(.name) {
    width: 50%;
  }

  table :global(.created) {
    width: 25%;
  }

  table :global(.copy-name) {
    width: 10%;
    text-align: right;
  }

  table :global(.info) {
    width: 10%;
    text-align: right;
  }

  /*table {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1000px;
    margin: 0;
    margin-left: auto;
    margin-right: auto;
    padding: 0;
  }

  tbody {
    margin: 0;
    padding: 0;
    margin-top: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ccc;
  }

  tbody:last-child {
    border-bottom: none;
  }

  @media (max-width: 767px) {
    table {
      margin-bottom: 35px;
    }
  }

  p {
    text-align: center;
    font-style: italic;
  }*/
</style>

<!--<svelte:window on:dockerimgs:refresh={refresh} /> -->

<table>
  <thead>
    <tr>
      <th class="name">Name</th>
      <th class="created">Created</th>
      <th class="copy-name">Copy name</th>
      <th class="info">Info</th>
    </tr>
  </thead>
  <tbody>
    {#each Object.keys($imgs) as name (name)}
      {#each $imgs[name] as tag (tag)}
        <DockerImg {name} {tag} />
      {/each}
    {:else}
      <p>Docker images not found</p>
    {/each}
  </tbody>
</table>
