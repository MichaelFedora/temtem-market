<template>
<div id='tem-listings'>
  <tem-listing-table extended :listings='listings' @click='click' />
</div>
</template>
<script src='./listings.ts'></script>
<style lang='scss'>
div#tem-listings {
  display: flex;
  justify-content: center;

  padding: 2em;
}
</style>
