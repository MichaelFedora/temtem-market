import Vue from 'vue';

export default Vue.component('tem-tem', {
  computed: {
    temID() { return this.$route.params.id; }
  }
});
