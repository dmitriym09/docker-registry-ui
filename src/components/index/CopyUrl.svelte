<script>
  export let table = null;
  export let btn = null;

  function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
      return clipboardData.setData("Text", text);
    } else if (
      document.queryCommandSupported &&
      document.queryCommandSupported("copy")
    ) {
      var textarea = document.createElement("textarea");
      textarea.textContent = text;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        return document.execCommand("copy");
      } catch (ex) {
        console.warn("Copy to clipboard failed.", ex);
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }

  const click = () => {
    const actives = [...table.querySelectorAll("tr.active")];
    let url = `${location}?${actives
      .map(row => {
        return `row=${row.id}`;
      })
      .join("&")}`;
    if (actives.length > 0) {
      url += "&save=1";
    }

    copyToClipboard(url);
  };
</script>

<style>
  button {
    display: block;
    cursor: pointer;

    width: 120px;
    margin: 20px;

    background-color: #2696ecff;
    color: #fff;
    border: 1px solid #fff;
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

  @media (max-width: 767px) {
    button {
      width: 30%;
      margin: 0px;
      text-overflow: ellipsis;
    }
  }
</style>

<button on:click={click} bind:this={btn}>Copy URL</button>
