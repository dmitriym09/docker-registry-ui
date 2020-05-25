<script>
  import { onMount } from "svelte";
  import getManifests from "../../helpers/manifests.mjs";

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
  td {
    vertical-align: middle;
  }

  .copy-name {
    text-align: right;
  }

  .btn {
    cursor: pointer;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    margin: 0;
    margin-left: auto;
    padding: 0;
    justify-content: center;
    align-items: center;
    border: 1px lightgray solid;
    border-radius: 3px;
    background-color: #fefefe;
    outline: none;
    box-shadow: none;
  }

  .btn svg {
    height: 95%;
    width: 95%;
    display: block;
  }

  .btn :global(svg > *) {
    transition: fill 0.1s ease-in;
  }

  .btn:hover :global(svg > *) {
    fill: #2696ec;
    transition: fill 0.1s ease-out;
  }
</style>

<tr>
  <td class="name">
    <a href="/desc?name={name}&tag={tag}">{name}:{tag}</a>
  </td>
  <td class="created">
    {!!manifests ? manifests.history[0].v1Compatibility.created.toLocaleString() : ''}
  </td>
  <td class="copy-name">
    <button class="btn btn-copy" aria-label="Copy name" on:click={copyName}>
      <svg viewBox="-40 0 512 512">
        <use href="#copy-icon" />
      </svg>
    </button>
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
