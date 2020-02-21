import Vue from 'vue';
import temApi from 'frontend/services/tem-api';
import { getDiscordAvatar } from 'common/api/util';

export default Vue.component('tem-register', {
  props: {
    userID: { required: true, type: String },
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
    avatarURL(): string {
      return getDiscordAvatar(this.userID, this.avatar);
    }
  },
  methods: {
    async register() {
      if(this.working) return;
      this.working = true;
      this.error = '';

      try {
        await temApi.register(this.name, this.avatar, this.tamerName, this.tamerID);
        this.$emit('confirm');
      } catch(e) {
        console.error('Error registering: ', e.message || e);
        this.error = e.message;
      }
      this.working = false;
    },
    cancel() {
      this.$emit('cancel');
    }
  }
});
