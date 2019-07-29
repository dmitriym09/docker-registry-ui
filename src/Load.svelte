<script>
  export let table = null;
  export let input = null;
  export let btn = null;

  import { isBlocked, updateDockerImgs } from "./stores.js";

  import { dispatch } from './helpers/eventbus.js'

  const onChange = event => {
    if (input.files.length == 0) {
      return;
    }

    const forms = [];

    for (const file of input.files) {
      const formData = new FormData();
      formData.append("file", file);
      forms.push(formData);
    }

    isBlocked.set(true);


    Promise.all(
      forms.map(form => {
        return fetch(`/api/load`, {
          method: "POST",
          body: form
        });
      })
    )
      .then(results => {
        const promises = [];
        for (const res of results) {
          if (res.status != 201) {
            throw new Error(res.status);
          }
        }
        return Promise.all(promises);
      })
      .catch(err => {
        console.warn(err);
        alert("Error load");
      })
      .finally(() => {
        updateDockerImgs.set(Date.now());

        dispatch('dockerimgs:update');
      });
  };
</script>

<style>
  button {
    display: block;
    position: absolute;
    bottom: 10%;
    right: 20%;
    cursor: pointer;

    background-color: #2696ecff;
    color: #fff;
    border: none;
    border-radius: 3px;

    transition: background-color 0.2s ease-out, transform 0.2s ease-out;
  }

  button:active:not(:disabled),
  button:hover:not(:disabled),
  button:focus:not(:disabled) {
    background-color: #2696eccc;
    border-radius: 3px;
    transform: scale(0.9);
  }

  button:active(:disabled),
  button:hover(:disabled) {
    color: #eee;
  }

  button:disabled {
    background-color: #eee;
    color: #222;
    cursor: auto;
  }

  input {
    display: none;
  }
</style>

<button
  on:click={() => {
    input.click();
  }}
  bind:this={btn}>
  Load
</button>
<input type="file" accept=".tar" on:change={onChange} bind:this={input} />
