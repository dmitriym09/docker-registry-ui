<script>
  export let table = null;
  export let btn = null;

  const download = uri => {
    return new Promise(resolve => {
      let filename = null;
      fetch(uri)
        .then(res => {
          //console.log(res.headers['content-disposition'])
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
          console.warn();
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
    btn.disabled = true;

    const _download = () => {
      if (actives.length == 0) {
        btn.disabled = false;

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
    position: absolute;
    bottom: 10%;
    right: 10%;
    cursor: pointer;

    background-color: #2696ECff;
    color: #fff;
    border: none;
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
</style>

<button on:click={click} bind:this={btn}>Save</button>
