<template>
<div id='tem-register' class='modal-card' style='width: auto'>
  <header class='modal-card-head'>
    <p class='modal-card-title'>Register</p>
  </header>

  <section class='modal-card-body'>
    <div>
      <img :src='avatarURL'>
    </div>
    <b-field>
      <b-input placeholder='Discord Name' :value='name' disabled />
    </b-field>
    <b-field>
      <b-input placeholder='Tamer Name' />
    </b-field>
    <b-field>
      <b-input placeholder='Tamer ID' />
    </b-field>
  </section>

  <footer class='modal-card-foot'>
    <button class='button' :disabled='working' @click='cancel()'>Cancel</button>
    <button class='button is-primary' :disabled='!valid || working' @click='register()'>Register</button>
  </footer>
</div>
</template>
<script src='./register.ts'></script>
<style lang='scss'>
div#tem-register {
  section.modal-card-body {
    display: flex;
    flex-flow: column;
    align-items: stretch;
    > :not(:first-child) {
      margin-top: 0.5rem;
    }
  }
}
</style>
