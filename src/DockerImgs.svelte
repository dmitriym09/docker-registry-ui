<script>
  export let catalogs = [];
  export let tags = {};
  export let active = false;
  export let table = null;

  import { isBlocked } from "./stores.js";

  let cntRows = 0;
  const createRow = row => {
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

    fetch("/api/catalog")
      .then(res => {
        if (res.status != 200) {
          throw new Error(res.status);
        }
        return res.json();
      })
      .then(data => {
        catalogs = Object.keys(data).sort();
        tags = catalogs.reduce((acm, key) => {
          acm[key] = data[key].sort();
          return acm;
        }, {});
      })
      .catch(err => {
        console.warn(err);
      })
      .finally(() => {
        isCatalogFetch = false;
        isBlocked.set(false);
      });
  };

  refresh();
</script>

<style>
  table {
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

  tr {
    display: flex;
    margin: 0;
    padding: 5px;
    cursor: pointer;
    justify-content: space-around;
    transition: background-color 0.2s ease-out, transform 0.2s ease-out,
      color 0.2s ease-out;
  }

  tr.active {
    transform: scale(0.9);
    background-color: #2696ec99;
    color: #222;
    border-radius: 3px;
  }

  tr:hover {
    background-color: #2696ecff;
    color: #eee;
    border-radius: 3px;
  }

  td {
    margin: 0;
    padding: 0;
    user-select: none;
  }

  td.catalog {
    width: 65%;
    text-align: center;
  }

  td.tag {
    width: 25%;
  }

  @media (max-width: 767px) {
    table {
      margin-bottom: 35px;
    }
    tr {
      flex-direction: column;
      align-items: center;
      padding: 5px;
    }

    td {
      margin: 0;
      padding: 5px;
    }

    td.catalog,
    td.tag {
      width: 45%;
      width: 45%;
      text-align: center;
    }
  }

  p {
    text-align: center;
    font-style: italic;
  }
</style>

<svelte:window on:dockerimgs:refresh={refresh} />

<table bind:this={table}>
  {#each catalogs as catalog}
    <tbody>
      {#each tags[catalog] as tag}
        <tr
          use:createRow
          class:active
          id={`${catalog}-${tag}`}
          on:click={onRowClicked}>
          <td class="catalog">{catalog}</td>
          <td class="tag">{tag}</td>
        </tr>
      {/each}
    </tbody>
  {:else}
    <p>Docker images not found</p>
  {/each}
</table>
