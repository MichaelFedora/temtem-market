<template>
<button id='tem-add-fab' @click='click()'>
  <b-icon icon='plus' size='is-large' />
</button>
</template>

<script src='./add-fab.ts'></script>
<style lang='scss'>
button#tem-add-fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: hsl(171, 100%, 41%);
  color: white;

  border: none;
  padding: 0.75rem;
  box-shadow: 0 1px 5px rgba(0,0,0,0.33);
  border-radius: 50%;

  cursor: pointer;
  user-select: none;
  z-index: 1;
}
</style>
