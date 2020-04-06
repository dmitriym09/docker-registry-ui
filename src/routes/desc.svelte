<script context="module">
  export async function preload(page, session) {
    //TODO: errpage

    return { tag: page.query.tag, name: page.query.name };
  }
</script>

<script>
  import { onMount } from "svelte";
  import History from "../components/History.svelte";

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
  /* your styles go here */
</style>

<h1>{name}:{tag}</h1>

<h3>{!!manifests ? manifests.architecture : ''}</h3>
<h3>
  {!!manifests ? manifests.history[0].v1Compatibility.created.toLocaleString() : ''}
</h3>
<h3>Digest: {!!manifests ? manifests.fsLayers[0].blobSum : ''}</h3>

{#if !!manifests}
  {#each manifests.history as { v1Compatibility }}
    <History history={v1Compatibility} />
  {/each}
{/if}
