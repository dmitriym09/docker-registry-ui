<script>
  import Header from "./Header.svelte";
  import DockerImgs from "./DockerImgs.svelte";
  import Save from "./Save.svelte";
  import Load from "./Load.svelte";
  import Blocker from "./Blocker.svelte";

  export let table = null;
</script>

<style>
  :global(html),
  :global(body) {
    height: 100%;
    margin: 0;
    padding: 0;
    min-width: 320px;
  }
  .page {
    background-color: #fff;
    height: 100%;
    margin: 0;
    padding: 0;
    margin-bottom: -50px;
  }
  .main {
    margin: 0;
    padding: 15px;
  }
</style>

<div class="page">
  <Header />
  <section class="main">
    <DockerImgs bind:table />
    <Load {table} />
    <Save {table} />
    <section />
  </section>

  <Blocker />
</div>
