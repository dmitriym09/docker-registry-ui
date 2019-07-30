<script>
  import Header from "./Header.svelte";
  import DockerImgs from "./DockerImgs.svelte";
  import Save from "./Save.svelte";
  import Load from "./Load.svelte";
  import CopyUrl from "./CopyUrl.svelte";
  import Blocker from "./Blocker.svelte";

  export let table = null;
</script>

<style>
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
    <DockerImgs bind:table />
  </section>

  <div class="sticky">
    <CopyUrl {table} />
    <Load {table} />
    <Save {table} />
  </div>

<Blocker />
</div>