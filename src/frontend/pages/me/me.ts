import Vue from 'vue';
import dataBus from 'frontend/services/data-bus';
import localApi from 'frontend/services/local-api';
import { User, Listing } from 'frontend/data/data';

import ListingCard from 'frontend/components/listing-card/listing-card';
import ListingModalComponent from 'frontend/components/listing-modal/listing-modal';

export default Vue.component('tem-me', {
  components: { ListingCard },
  data() {
    return {
      state: dataBus.state,
      listings: [] as Listing[],

      tamerName: '',
      tamerID: '',

      editing: false,
      working: false,
    };
  },
  computed: {
    loggedIn(): boolean { return Boolean(localApi.sid && this.state.user.id); },
    me(): User { return this.state.user ? this.state.user : { } as any; }
  },
  watch: {
    loggedIn(n) {
      if(!n)
        this.$router.push('/');
    }
  },
  mounted() {
    if(!this.loggedIn) {
      this.$router.push('/');
      return;
    }
    localApi.getSelf().then(u => {
      dataBus.setUser(u);
    }, e => this.error(e, 'Error getting self'));

    this.refresh();
  },
  methods: {
    error(e: Error, msg?: string): void {
      const message = (msg || 'Error') + ' :' + e.message || String(e);
      this.$buefy.notification.open({ type: 'is-danger', hasIcon: true, message });
      console.error(message);
    },
    getStatusIcon(status: 'online' | 'in_game' | 'invisible') {
      switch(status) {
        case 'online': return 'web';
        case 'in_game': return 'gamepad-variant';
        case 'invisible': return 'sleep';
        default: return 'help';
      }
    },
    async refresh() {
      if(this.working) return;
      this.working = true;
      await localApi.getMyListings().then(
        d => this.listings = d,
        e => this.error(e, 'Error getting "my" listings'));
      this.working = false;
    },
    click(listing: Listing) {
      console.log('Clicked listing: ' + listing.id + ' from user ' + listing.user);
      const m = this.$buefy.modal.open({
        hasModalCard: true,
        props: { listing },
        component: ListingModalComponent,
        parent: this,
        trapFocus: true,
        canCancel: ['x', 'escape'],
        events: {
          cancel: () => { m.close(); this.refresh(); }
        }
      });
    },
    edit() {
      this.tamerName = this.me.temUserName;
      this.tamerID = this.me.temUserID;
      this.editing = true;
    },
    cancel() {
      if(this.working) return;
      this.editing = false;
    },
    async del() {
      if(this.working) return;
      this.working = true;

      try {

        const choice = await new Promise(res => {
          const m = this.$buefy.dialog.confirm({
            message: 'Are you sure you want to delete your account?',
            type: 'is-danger',
            confirmText: 'Yes',
            cancelText: 'No',
            onCancel() { res(false); m.close(); },
            onConfirm() { res(true); m.close(); }
          });
        });

        if(choice) {

          await localApi.deleteSelf();

          localApi.sid = '';
          dataBus.setUser(null);
        }
      } catch(e) {
        this.error(e, 'Error deleting self');
      }

      this.working = false;
    },
    async save() {
      if(this.working) return;
      this.working = true;

      try {
        await localApi.updateTemInfo({
          temUserName: this.tamerName,
          temUserID: this.tamerID
        });
      } catch(e) {
        this.error(e);
      }

      this.editing = false;
      this.working = false;
    }
  }
});
