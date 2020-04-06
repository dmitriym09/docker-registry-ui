<script>
  import { onMount } from "svelte";
  import Header from "../components/Header.svelte";
  import DockerImgs from "../components/DockerImgs.svelte";
  // import Save from "../components/Save.svelte";
  // import Load from "../components/Load.svelte";
  // import CopyUrl from "../components/CopyUrl.svelte";
  import Blocker from "../components/Blocker.svelte";

  import { isBlocked, imgs } from "../stores.mjs";

  //export let table = null;

  onMount(async () => {
    const responsev2 = await fetch("/v2/");
    if (responsev2.status != 200) {
      throw new Error(); //TODO: impl
    }
    const contentv2 = await responsev2.json();
    if (!(typeof contentv2 == "object" && Object.keys(contentv2).length == 0)) {
      throw new Error(); //TODO: impl
    }
    const responseCatalog = await fetch("/v2/_catalog");
    if (responseCatalog.status != 200) {
      throw new Error(); //TODO: impl
    }
    const catalog = (await responseCatalog.json()).repositories.reduce(
      (acm, name) => {
        acm[name] = [];
        return acm;
      },
      {}
    );
    const responsesTags = await Promise.all(
      Object.keys(catalog).map(repo => fetch(`/v2/${repo}/tags/list`))
    );
    for (const response of responsesTags) {
      const content = await response.json();
      catalog[content.name] = content.tags;
    }

    $imgs = catalog;

    $isBlocked = false;
  });
</script>

<style>
  :global(html),
  :global(body) {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    min-width: 320px;
    min-height: 240px;
  }

  :global(body) {
    color: #333;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  :global(a) {
    color: rgb(0, 100, 200);
    text-decoration: none;
  }

  :global(a:hover) {
    text-decoration: underline;
  }

  :global(a:visited) {
    color: rgb(0, 80, 160);
  }

  :global(label) {
    display: block;
  }

  :global(input),
  :global(button),
  :global(select),
  :global(textarea) {
    font-family: inherit;
    font-size: inherit;
    padding: 0.4em;
    margin: 0 0 0.5em 0;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 2px;
  }

  :global(input:disabled) {
    color: #ccc;
  }

  :global(input[type="range"]) {
    height: 0;
  }

  :global(button) {
    color: #333;
    background-color: #f4f4f4;
    outline: none;
  }

  :global(button:active) {
    background-color: #ddd;
  }

  :global(button:focus) {
    border-color: #666;
  }

  .page {
    background-color: #fff;
    margin: 0;
    padding: 0;
  }

  section {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  .sticky {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    padding-right: 20px;

    position: sticky;
    bottom: 10px;
  }

  @media (max-width: 767px) {
    .page {
      height: calc(100% - 75px);
      margin-bottom: -75px;
    }

    .sticky {
      justify-content: space-around;
      padding-right: 0px;
    }
  }
</style>

<div class="page">
  <Header />
  <section>
    <slot />
  </section>

  <!--<div class="sticky">
    <CopyUrl {table} />
    <Load {table} />
    <Save {table} />
  </div>-->

  <Blocker />
</div>
