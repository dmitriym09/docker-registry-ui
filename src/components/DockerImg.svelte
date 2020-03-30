<script>
  export let name;
  export let tag;
</script>

<style>
  tr {
    display: flex;
    margin: 0;
    padding: 5px;
    cursor: pointer;
    justify-content: space-around;
    transition: background-color 0.2s ease-out, transform 0.2s ease-out,
      color 0.2s ease-out;
  }

  tr:hover {
    background-color: #2696ecff;
    color: #eee;
    border-radius: 3px;
  }

  td {
    margin: 0;
    padding: 0;
    user-select: none;
  }

  td.name {
    width: 60%;
    text-align: center;
  }

  td.tag {
    width: 17%;
  }

  td.created {
    width: 17%;
  }

  @media (max-width: 767px) {
    tr {
      flex-direction: column;
      align-items: center;
      padding: 5px;
    }

    td {
      margin: 0;
      padding: 5px;
    }

    td.catalog,
    td.tag,
    td.created {
      width: 32%;
      width: 32%;
      text-align: center;
    }
  }
</style>

<tr>
  <td class="name">{name}</td>
  <td class="tag">{tag}</td>
  <td class="created">{new Date().toLocaleString()}</td>
</tr>

<!--<tr
          use:createRow
          class:active={selectedFromUrl.has(`${catalog}-${tag.tag}`)}
          id={`${catalog}-${tag.tag}`}
          on:click={onRowClicked}>
          <td class="catalog">{catalog}</td>
          <td class="tag">{tag.tag}</td>
          <td class="created">{new Date(tag.history[0].v1Compatibility.created).toLocaleString()}</td>
        </tr>-->
