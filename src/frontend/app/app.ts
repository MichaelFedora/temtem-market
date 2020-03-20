import Vue from 'vue';
import { debounce } from 'lodash';

import localApi from 'frontend/services/local-api';
import dataBus from 'frontend/services/data-bus';

import RegisterComponent from '../components/register/register';
import AutofillComponent from '../components/autofill-modal/autofill-modal';
import ListingModalComponent from '../components/listing-modal/listing-modal';

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
    showSearch(): boolean { return this.$route.path && this.$route.path !== '/'; },
    gdprLink(): string { return localApi.gdprLink; }
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

    if(!localStorage.getItem('warned')) {
      const note = this.$buefy.notification.open({
        indefinite: true,
        message: 'Please note: temtemm.market is a fan site that is not associated with Crema in any way',
        type: 'is-info',
        hasIcon: true,
        queue: false
      });
      (note as any).$on('close', () => localStorage.setItem('warned', 'yes'));
    }
  },
  methods: {
    error(e: Error, msg?: string): void {
      const message = (msg || 'Error') + ' :' + e.message || String(e);
      this.$buefy.notification.open({ type: 'is-danger', hasIcon: true, message });
      console.error(message);
    },
    async logout() {
      if(this.working) return;
      this.working = true;

      try {
        await localApi.logout();
        localApi.sid = '';
        dataBus.setUser(null);
      } catch(e) {
        const message = 'Error logging out: ' + e.message || String(e);
        this.$buefy.notification.open({ type: 'is-danger', hasIcon: true, message });
        console.error(message);
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
        const message = 'Error setting status: ' + e.message || String(e);
        this.$buefy.notification.open({ type: 'is-danger', hasIcon: true, message });
        console.error(message);
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
        const message = 'Error registering: ' + e.message || String(e);
        this.$buefy.dialog.alert({ type: 'is-danger', hasIcon: true, message });
        console.error(message);
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
    },
    addListing() {
      if(this.$route.params.id) {
        this.add(Number(this.$route.params.id));
      } else {
        const m = this.$buefy.modal.open({
          hasModalCard: true,
          component: AutofillComponent,
          parent: this,
          trapFocus: true,
          canCancel: ['x', 'escape'],
          events: {
            confirm: (tem) => { this.add(tem.id); m.close(); },
            cancel: () => { m.close(); }
          }
        });
      }
      this.updateShowMenu(false);
    },
    add(temID: number) {
      const m = this.$buefy.modal.open({
        hasModalCard: true,
        props: { temID },
        component: ListingModalComponent,
        parent: this,
        trapFocus: true,
        canCancel: ['x', 'escape'],
        events: {
          cancel: () => { m.close(); }
        }
      });
    },
    async gdpr() {
      if(this.working) return;
      this.working = true;
      try {
        const gdpr = await localApi.gdpr();
        const m = this.$buefy.dialog.alert({
          message: `<pre>${JSON.stringify(gdpr, null, 2)}</pre>`
        });
      } catch(e) {
        this.error(e, 'Error getting gdpr');
      }

      this.working = false;
    }
  }
});
