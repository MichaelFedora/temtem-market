import Vue from 'vue';
import { getTemIcon } from 'common/api/util';
import dataBus from 'frontend/services/data-bus';
import { Temtem, Listing } from 'frontend/data/data';
import localApi from 'frontend/services/local-api';
import ListingTableComponent from 'frontend/components/listing-table/listing-table';
import ListingModalComponent from 'frontend/components/listing-modal/listing-modal';

export default Vue.component('tem-tem', {
  components: { ListingTableComponent },
  data() {
    return {
      listings: [],
      more: false,
      state: dataBus.state,
    };
  },
  computed: {
    loggedIn(): boolean { return Boolean(localApi.sid && this.state.user.id); },
    tem(): Temtem {
      return dataBus.state.temDB
        .find(a => a.id === Number(this.$route.params.id));
    },
    evoTem(): Temtem {
      if(!this.tem)
        return;
      const evoTemID = this.tem.evolution[this.tem.evolution.length - 1];
      if(!evoTemID || evoTemID === this.tem.id)
        return;

      return dataBus.state.temDB.find(a => a.id === evoTemID);
    },
    temIcon(): string {
      return this.tem ? this.getTemIcon(this.tem.id) : '';
    },
    evoTemIcon(): string {
      return this.evoTem ? this.getTemIcon(this.evoTem.id) : '';
    }
  },
  watch: {
    tem(n) {
      if(n)
        this.refresh();
      else {
        this.listings = [];
        this.more = false;
      }
    }
  },
  mounted() {
    this.refresh();
  },
  methods: {
    async refresh() {
      let listings: Listing[] = [];
      try {
        listings = await localApi.getListingsForTem(this.$route.params.id, { limit: 10 });
      } catch(e) {
        const message = 'Error getting listings: ' + e.message || String(e);
        this.$buefy.notification.open({ type: 'is-danger', hasIcon: true, message });
        console.error(message);
      }

      this.more = listings.length >= 10;
      this.listings = listings;
    },
    getTemIcon(temID: number, luma?: boolean): string {
      return '/assets/sprites/' + getTemIcon(temID, luma);
    },
    getStatClass(stat: number) {
      if(stat < 33) return 'stat-red';
      if(stat < 66) return 'stat-orange';
      if(stat < 100) return 'stat-green';
      return 'stat-blue';
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
    fetchMore() {
      localApi.getListingsForTem(this.$route.params.id, { start: this.listings.length, limit: 10 })
        .then(v => {
          if(v.length < 10)
            this.more = false;

          this.listings.push(...v);
        },
        e => console.error('Error getting listings for tem: ', e.message || e));
    },
    addListing() {
      if(!this.tem) return;
      const m = this.$buefy.modal.open({
        hasModalCard: true,
        props: { temID: this.tem.id },
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
