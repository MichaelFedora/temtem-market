<template>
<div id='tem-autofill-modal' class='modal-card' style='width: auto'>
  <header class='modal-card-head'>
    <p class='modal-card-title'>Lookup Temtem</p>
  </header>

  <section class='modal-card-body'>
    <b-autocomplete
      v-model='search'
      :placeholder='randomTem.name'
      :keep-first='true'
      :open-on-focus='true'
      :data='searchResults'
      field='name'
      @select='tem => $emit("confirm", tem)'
    />
  </section>

  <footer class='modal-card-foot'>
    <button class='button' @click='$emit("cancel")'>Cancel</button>
  </footer>
</div>
</template>
<script src='./autofill-modal.ts'></script>
<style lang='scss'>
div#tem-autofill-modal {
  overflow: visible;
  > section.modal-card-body {
    display: flex;
    flex-flow: column;
    align-items: stretch;
    overflow: visible;
  }
}
</style>
