<script>
  import { onMount } from "svelte";
  import Svg from "../components/Svg.svelte";
  import Header from "../components/Header.svelte";
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
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: #33444C;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }


  :global(h1) {
    text-align: center;
  }

  :global(a) {
    color: rgb(0, 100, 200);
    text-decoration: none;
    transition: color .1s ease-in;
  }

  :global(a:hover) {
    transition: color 0.1s ease-out, outline 0.1s ease-out;
    color: rgb(0, 80, 160);
  }

  :global(a:focus) {
    transition: color 0.1s ease-out, outline 0.1s ease-out;
    outline-width: 1px;
    outline-style: solid;
    outline-color: #ff4900;
    outline-offset: 5px;
  }

  :global(a:visited) {
    transition: color .1s ease-out;
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

  main {
    margin: 0 auto;
    padding: 0;
    width: 100%;
    max-width: 50rem;
    min-width: 20rem;
    min-height: 100%;
  }
</style>

<div class="page">
  <Header />
  <main>
    <slot />
  </main>

  <Blocker />
</div>

<Svg />
