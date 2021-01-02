<template>
<div id='tem-tems'>
  <tem-tem-table extended :tems='tems' @click='click' />
</div>
</template>
<script src='./tems.ts'></script>
<style lang='scss'>
div#tem-tems {
  display: flex;
  justify-content: center;

  padding: 2em;
}
</style>
