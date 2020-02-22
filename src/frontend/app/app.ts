import Vue from 'vue';
import { debounce } from 'lodash';

import localApi from 'frontend/services/local-api';
import dataBus from 'frontend/services/data-bus';

import RegisterComponent from '../components/register/register';

export default Vue.extend({
  components: { RegisterComponent },
  data() {
    return {
      showMenu: false,
      working: false,
      search: '',

      state: dataBus.state,
      dropdownVisible: false,

      registerSID: '',
      registerName: '',
      registerAvatar: ''
    };
  },
  computed: {
    loggedIn(): boolean { return Boolean(localApi.sid && this.state.user.id); },
    name(): string { return this.state.user ? this.state.user.discordName : ''; },
    avatar(): string { return this.state.user ? this.state.user.discordAvatar : ''; },
    tamerName(): string { return this.state.user ? this.state.user.temUserName : ''; },
    tamerID(): string { return this.state.user ? this.state.user.temUserID : ''; },
    status(): string { return this.state.user ? this.state.user.status : ''; },
    discordLoginURL(): string { return localApi.discordLoginURL; },
    showSearch(): boolean { return this.$route.path && this.$route.path !== '/'; }
  },
  watch: {
    search(n, o) {
      if(n !== o)
        this.updateSearch(n);
    },
  },
  async mounted() {
    this.updateSearch = debounce(this._updateSearch, 300);

    if(this.$route.query.register) {
      this.registerSID = String(this.$route.query.register || '');
      this.registerName = atob(String(this.$route.query.name || ''));
      this.registerAvatar = String(this.$route.query.avatar || '');

      const m = this.$buefy.modal.open({
        hasModalCard: true,
        props: { name: this.registerName, avatar: this.registerAvatar },
        component: RegisterComponent,
        parent: this,
        trapFocus: true,
        canCancel: ['x', 'escape'],
        events: {
          confirm: (e) => { this.registerConfirm(e); },
          cancel: () => { this.registerCancel(); m.close(); }
        }
      });
    }
  },
  methods: {
    async logout() {
      if(this.working) return;
      this.working = true;

      try {
        await localApi.logout();
        localApi.sid = '';
        dataBus.setUser(null);
      } catch(e) {
        console.error('Error logging out: ', e);
      }

      this.updateShowMenu(false);
      this.working = false;
    },
    async setStatus(status: 'online' | 'in_game' | 'invisible') {
      if(this.working) return;
      this.working = true;

      try {
        await localApi.changeStatus(status);
        this.state.user.status = status;
      } catch(e) {
        console.error('Erorr setting status: ', e);
      }

      this.updateShowMenu(false);
      this.working = false;
    },
    updateSearch(q: string) { },
    _updateSearch(q: string) {
      if(q) {
        this.$router.push({ path: '/', query: { q } }).then(() => {
          this.search = '';
          if(this.showMenu)
            this.updateShowMenu(false);
        }, e => console.error('Error pushing search: ', e));
      }
    },
    async registerConfirm({ tamerID, tamerName }: { tamerID: string; tamerName: string }) {
      if(this.working) return;
      this.working = true;

      localApi.sid = this.registerSID;
      try {
        await localApi.register(this.registerName, this.registerAvatar,tamerName, tamerID);
      } catch(e) {
        localApi.sid = '';
        alert('Error registering: ' + String(e.message || e));
        console.error('Error registering: ', e.message || e);
      }

      await this.$router.replace(this.$route.path).catch(e => { });
      location.reload();
    },
    registerCancel() {
      this.registerSID = '';
      this.registerAvatar = '';
      this.registerName = '';
      return this.$router.replace(this.$route.path).catch(e => console.error('Error replacing register path: ', e));
    },
    gotoProfile() {
      if(this.$route.path !== '/me')
        this.$router.push('/me').catch(e => console.error('Error pushing "/me": ', e));
    },
    isDesktop() { return window.innerWidth >= 1024; },
    updateShowMenu(v: boolean) {
      if(v === this.showMenu)
        return;

      if(this.dropdownVisible !== v && this.$refs['dropdown'])
        (this.$refs['dropdown'] as any).toggle();

      this.showMenu = v;
    },
    dropdownChange(v: boolean) {
      this.dropdownVisible = v;
      if(this.isDesktop())
        this.showMenu = v;
    }
  }
});
