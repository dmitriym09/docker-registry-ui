<script>
  import { onMount } from "svelte";
  import getManifests from "../helpers/manifests.mjs";

  export let name;
  export let tag;

  let manifests;

  onMount(async () => {
    //TODO: try
    manifests = await getManifests(name, tag);
  });

  async function copyName() {
    const result = await navigator.permissions.query({
      name: "clipboard-write"
    });
    if (result.state == "granted" || result.state == "prompt") {
      //TODO: exrernal registry name
      const item = new ClipboardItem({
        "text/plain": new Blob([`${name}:${tag}`], { type: "text/plain" })
      });
      await navigator.clipboard.write([item]);
      //TODO: notify
    } else {
      //TODO: notify
    }
  }
</script>

<style>
  /*tr {
    margin: 0;
    padding: 5px;
  }

  td {
    margin: 0;
    padding: 0;
    user-select: none;
  }

  td.name {
    text-align: left;
  }

  td.created {
  }

  button,
  a {
    cursor: pointer;
  }*/
</style>

<tr>
  <td class="name">{name}:{tag}</td>
  <td class="created">
    {!!manifests ? manifests.history[0].v1Compatibility.created.toLocaleString() : ''}
  </td>
  <td class="copy-name">
    <button class="btn-copy" aria-label="Copy name" on:click={copyName}>
      copy
    </button>
  </td>

  <td class="info">
    <a class="a-desc" aria-label="Open info" href="/desc?name={name}&tag={tag}">
      info
    </a>
  </td>
</tr>

<!--<tr
          use:createRow
          class:active={selectedFromUrl.has(`${catalog}-${tag.tag}`)}
          id={`${catalog}-${tag.tag}`}
          on:click={onRowClicked}>
          <td class="catalog">{catalog}</td>
          <td class="tag">{tag.tag}</td>
          <td class="created">{new Date(tag.history[0].v1Compatibility.created).toLocaleString()}</td>
        </tr>-->
