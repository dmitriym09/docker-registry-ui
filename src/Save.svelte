<script>
  export let table = null;
  export let btn = null;

  import { isBlocked } from './stores.js';

  const download = uri => {
    return new Promise(resolve => {
      let filename = null;
      fetch(uri)
        .then(res => {
          if (res.status != 200) {
            throw new Error(res.status);
          }

          const regex = /filename[^;=\n]*=(UTF-8(['"]*))?(.*)/;
          const matches = regex.exec(res.headers.get("content-disposition"));

          if (matches != null && matches[3]) {
            filename = matches[3].replace(/['"]/g, "");
          }

          return res.blob();
        })
        .then(blob => {
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setInterval(() => {
            a.remove();
          }, 100);
        })
        .catch(err => {
          console.warn(err);
          alert(`Error download ${uri}`);
        })
        .finally(resolve);
    });
  };

  const click = () => {
    const actives = [...table.querySelectorAll("tr.active")];
    if (actives.length == 0) {
      return alert("Not select images");
    }
    isBlocked.set(true);

    const _download = () => {
      if (actives.length == 0) {
        isBlocked.set(false);

        return;
      }

      const row = actives.pop();
      download(
        `/api/save?repo=${row.querySelector(".catalog").innerText}&tag=${
          row.querySelector(".tag").innerText
        }`
      ).finally(() => {
          row.classList.remove('active');
        _download();
      });
    };

    _download();
  };
</script>

<style>
  button {
    display: block;
    cursor: pointer;

    width: 120px;
    margin: 20px;

    background-color: #2696ECff;
    color: #fff;
    border: 1px solid #fff;
    border-radius: 3px;

    transition: background-color .2s ease-out, transform .2s ease-out;
  }

  button:active:not(:disabled),
  button:hover:not(:disabled),
  button:focus:not(:disabled) {
    background-color: #2696ECcc;
    border-radius: 3px;
    transform: scale(.9);
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

  @media (max-width: 767px) {
    button {
      width: 38%;
      margin: 0px;
    }
  }
</style>

<button on:click={click} bind:this={btn}>Save</button>
