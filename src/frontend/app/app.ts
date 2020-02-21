import Vue from 'vue';
import { debounce } from 'lodash';

import temApi from 'frontend/services/tem-api';
import dataBus from 'frontend/services/data-bus';

export default Vue.extend({
  data() {
    return {
      showMenu: false,
      working: false,
      search: '',

      registerName: '',
      registerAvatar: ''
    };
  },
  computed: {
    loggedIn(): boolean { return Boolean(temApi.sid && dataBus.user); },
    name(): string { return dataBus.user ? dataBus.user.discordName : ''; },
    avatar(): string { return dataBus.user ? dataBus.user.discordAvatar : ''; },
    tamerID(): string { return dataBus.user ? dataBus.user.temUserID : ''; },
    discordLoginURL(): string { return temApi.discordLoginURL; },
    showSearch(): boolean { return this.$route.path && this.$route.path !== '/'; }
  },
  watch: {
    search(n, o) {
      if(n !== o)
        this.updateSearch(n);
    }
  },
  mounted() {
    this.updateSearch = debounce(this._updateSearch, 300);

    if(this.$route.path.startsWith('/register')) {
      temApi.sid = String(this.$route.query.sid);
      this.registerAvatar = String(this.$route.query.avatar);
      this.registerName = String(this.$route.query.name);
      this.$router.replace(this.$route.path);
    } else if(this.$route.query.sid) {
      temApi.sid = String(this.$route.query.sid);
      this.$router.replace(this.$route.path);
      temApi.getSelf().then(u => this.$set(dataBus, 'user', u));
    }
  },
  methods: {
    async logout() {
      if(this.working) return;
      this.working = true;

      try {
        await temApi.logout();
        this.$set(temApi, 'sid', '');
        this.$set(dataBus, 'user', null);
      } catch(e) {
        console.error('Error logging out: ', e);
      }

      this.working = false;
    },
    async setStatus(status: 'online' | 'in_game' | 'invisible') {
      if(this.working) return;
      this.working = true;

      try {
        await temApi.changeStatus(status);
        this.$set(dataBus.user, 'status', status);
      } catch(e) {
        console.error('Erorr setting status: ', e);
      }

      this.working = false;
    },
    settings() {
      console.log('show settings popup.');
    },
    updateSearch(q: string) { },
    _updateSearch(q: string) {
      if(q) {
        this.$router.push({ path: '/', query: { q } }).then(() => {
          this.search = '';
          if(this.showMenu)
            this.showMenu = false;
        });
      }
    }
  }
});
