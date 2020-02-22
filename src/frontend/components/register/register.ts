import Vue from 'vue';

export default Vue.component('tem-register', {
  props: {
    name: { required: true, type: String },
    avatar: { required: true, type: String }
  },
  data() {
    return {
      tamerName: '',
      tamerID: '',
      working: false,
      error: '',
    };
  },
  computed: {
    valid(): boolean {
      return this.tamerName.length && /^\d+$/.test(this.tamerID);
    }
  },
  methods: {
    async register() {
      if(this.working) return;
      this.working = true;
      this.error = '';

      this.$emit('confirm', { tamerName: this.tamerName, tamerID: this.tamerID });
      /* try {
        await temApi.register(this.name, this.avatar, this.tamerName, this.tamerID);
        this.$emit('confirm');
      } catch(e) {
        console.error('Error registering: ', e.message || e);
        this.error = e.message;
      }*/
      this.working = false;
    },
    cancel() {
      this.$emit('cancel');
    }
  }
});
