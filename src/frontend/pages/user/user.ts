import Vue from 'vue';
import dataBus from 'frontend/services/data-bus';
import localApi from 'frontend/services/local-api';
import { Listing, PublicUser } from 'frontend/data/data';

import ListingCard from 'frontend/components/listing-card/listing-card';
import ListingModalComponent from 'frontend/components/listing-modal/listing-modal';

export default Vue.component('tem-user', {
  components: { ListingCard },
  data() {
    return {
      state: dataBus.state,
      listings: [] as Listing[],
      user: { } as PublicUser,

      tamerName: '',
      tamerID: '',

      editing: false,
      working: false,
    };
  },
  computed: {
    self(): boolean { return Boolean(localApi.sid && this.state.user.id && this.state.user.id === this.user.id); }
  },
  watch: {
    $route() {
      if(!this.user.id || this.$route.params.id !== this.user.id)
        this.refresh();
    }
  },
  mounted() {
    this.refresh();
  },
  methods: {
    error(e: Error, msg?: string): void {
      const message = (msg || 'Error') + ' :' + e.message || String(e);
      this.$buefy.notification.open({ type: 'is-danger', hasIcon: true, message });
      console.error(message);
    },
    getStatusIcon(status: 'online' | 'in_game' | 'offline') {
      switch(status) {
        case 'online': return 'web';
        case 'in_game': return 'gamepad-variant';
        case 'offline': return 'sleep';
        default: return 'help';
      }
    },
    async refresh() {
      if(this.working) return;
      this.working = true;

      this.editing = false;

      await Promise.all([
        localApi.getUser(this.$route.params.id).then(u => {
          this.user = u;
        }, e => this.error(e, 'Error getting user')),
        localApi.getListingsForUser(this.$route.params.id).then(
          d => this.listings = d,
          e => this.error(e, 'Error getting listings for user'))
      ]);

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
      if(!this.self) return;
      this.tamerName = this.user.temUserName;
      this.tamerID = this.user.temUserID;
      this.editing = true;
    },
    cancel() {
      if(this.working) return;
      this.editing = false;
    },
    async del() {
      if(this.working || !this.self) return;
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
      if(this.working || !this.self) return;
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

      return this.refresh();
    }
  }
});
