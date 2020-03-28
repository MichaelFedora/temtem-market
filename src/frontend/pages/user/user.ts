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

      working: false,
    };
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
    }
  }
});
