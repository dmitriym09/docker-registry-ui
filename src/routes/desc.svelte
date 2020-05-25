<script context="module">
  export async function preload(page, session) {
    //TODO: errpage

    return { tag: page.query.tag, name: page.query.name };
  }
</script>

<script>
  import { onMount } from "svelte";

  import getManifests from "../helpers/manifests.mjs";

  export let name;
  export let tag;

  let manifests;
  $: console.log(manifests);

  onMount(async () => {
    //TODO: try
    manifests = await getManifests(name, tag);
  });
</script>

<style>
  .desc-item {
    margin: 0;
  }
  .desc-name {
    display: inline-block;
    font-style: italic;
    width: 7rem;
  }
</style>

<h1>{name}:{tag}</h1>

{#if !!manifests}
  <section>
    <h2>Description</h2>

    {#if !!manifests.history && manifests.history.length > 0}
      <p class="desc-item">
        <span class="desc-name">OS:</span>
        {manifests.history[0].v1Compatibility.os}
      </p>
    {/if}

    {#if !!manifests.architecture}
      <p class="desc-item">
        <span class="desc-name">Architecture:</span>
        {manifests.architecture}
      </p>
    {/if}

    {#if !!manifests.history && manifests.history.length > 0}
      <p class="desc-item">
        <span class="desc-name">Created:</span>
        {manifests.history[0].v1Compatibility.created.toLocaleString()}
      </p>
    {/if}

    {#if !!manifests.fsLayers && manifests.fsLayers.length > 0}
      <p class="desc-item">
        <span class="desc-name">Digest:</span>
        {manifests.fsLayers[0].blobSum}
      </p>
    {/if}

    {#if !!manifests.history && manifests.history.length > 0 && !!manifests.history[0].v1Compatibility.author}
      <p class="desc-item">
        <span class="desc-name">Author:</span>
        {manifests.history[0].v1Compatibility.author}
      </p>
    {/if}

    {#if !!manifests.history && manifests.history.length > 0}
      <p class="desc-item">
        <span class="desc-name">Count layers:</span>
        {manifests.history.length}
      </p>
    {/if}

    {#if !!manifests.history && manifests.history.length > 0}
      <p class="desc-item">
        <span class="desc-name">Size:</span>
        {manifests.history.reduce((size, item) => {
          size += item.v1Compatibility.size;
          return size;
        }, 0)}B
      </p>
    {/if}

  </section>
{/if}
