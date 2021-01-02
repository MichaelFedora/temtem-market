import Vue from 'vue';

import localApi from 'frontend/services/local-api';
import { Listing } from 'frontend/data/data';

import ListingTableComponent from 'frontend/components/listing-table/listing-table';
import ListingModalComponent from 'frontend/components/listing-modal/listing-modal';


export default Vue.component('tem-listings', {
  components: { ListingTableComponent } ,
  data() { return {
    working: false,
    listings: [] as Listing[]
  }; },
  mounted() { this.refresh(); },
  methods: {

    async refresh() {
      if(this.working) return;
      this.working = true;
      await localApi.getRecentListings().then(
        d => this.listings = d,
        e => console.error('Error getting recent listings: ', e));
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
  }
});
