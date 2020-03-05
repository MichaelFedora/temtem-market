import Vue from 'vue';
import { PropValidator } from 'vue/types/options';
import { Listing, PartialListing, Temtem } from 'frontend/data/data';
import dataBus from 'frontend/services/data-bus';
import { getTemIcon } from 'common/api/util';
import localApi from 'frontend/services/local-api';

const NULL_PARTIAL_LISTING = Object.freeze({
  temID: 0,
  type: 'sell',
  luma: false,
  level: undefined,
  sex: 'm',
  svs: { hp: undefined, sta: undefined, spd: undefined, atk: undefined, def: undefined, spatk: undefined, spdef: undefined },
  tvs: { hp: undefined, sta: undefined, spd: undefined, atk: undefined, def: undefined, spatk: undefined, spdef: undefined },
  trait: undefined,
  bred_techniques: [],
  price: undefined,
} as PartialListing);

export default Vue.component('tem-listing-modal', {
  props: {
    listing: { type: Object, required: false, default: (() => (null as Listing)) } as PropValidator<Listing>,
    temID: { type: Number, required: false, default: 0 }
  },
  data() {
    return {
      state: dataBus.state,
      editing: false,
      working: false,

      partial: Object.assign({ }, NULL_PARTIAL_LISTING) as PartialListing
    };
  },
  computed: {
    tem(): Temtem {
      if(this.listing)
        return this.state.temDB.find(a => a.id === this.listing.temID)
      else if(this.temID)
        return this.state.temDB.find(a => a.id === this.temID)
    },
    temIcon(): string {
      return this.tem ? this.getTemIcon(this.tem.id, this.editing ? this.partial.luma : this.listing ? this.listing.luma : false) : '';
    },
    owned(): Boolean {
      return this.listing ? this.state.user.id === this.listing.userID : true;
    },
    title(): string {
      if(this.listing) {
        if(!this.editing)
          return 'Listing Details';
        else
          return 'Edit Listing';
      } else
        return 'Create Listing';
    },
    error(): string {
      if(!this.partial.trait) return 'No trait!';
      if(!this.partial.level || this.partial.level <= 0) return 'Level is less than 1!';
      if(!this.partial.type) return 'No listing type!';
      if(Object.values(this.partial.svs).findIndex(a => a == undefined || a === '' || a < 1 || a > 50) >= 0) return 'Some SVs are missing or out of bounds!'
      if(Object.values(this.partial.tvs).findIndex(a => a == undefined || a === '' || a < 0 || a > 500) >= 0) return 'Some TVs are missing or out of bounds!';
      if(Object.values(this.partial.tvs).reduce((acc, c) => acc + (Number(c) || 0), 0) > 1000) return 'Sum of all TVs is over 1,000!';
      if(!this.partial.price || this.partial.price <= 0) return 'Price is less than 1!';
    },
    valid(): boolean {
      if(this.error)
        return false;

      if(this.listing)
        return JSON.stringify(this.partial) !== JSON.stringify(this.makePartial(this.listing))

      return true;
    }
  },
  mounted() {
    if(!this.listing)
      this.editing = true;

    this.partial.temID = this.tem.id;
  },
  methods: {
    getTemIcon(temID: number, luma?: boolean): string {
      return '/assets/sprites/' + getTemIcon(temID, luma);
    },
    makePartial(listing: Listing): PartialListing {
      return Object.assign({ }, {
        temID: listing.temID,
        type: listing.type,
        luma: listing.luma,
        level: listing.level,
        sex: listing.sex,
        svs: Object.assign({ }, listing.svs),
        tvs: Object.assign({ }, listing.tvs),
        trait: listing.trait,
        bred_techniques: listing.bred_techniques.slice(),
        price: listing.price
      } as PartialListing)
    },
    async del() {
      if(!this.listing || !this.owned) return;
      if(this.working) return;
      this.working = true;

      try {
        const choice = await new Promise(res => {
          const m = this.$buefy.dialog.confirm({
            message: 'Are you sure you want to delete this listing?',
            type: 'is-danger',
            confirmText: 'Yes',
            cancelText: 'No',
            onCancel() { res(false); },
            onConfirm() { res(true); }
          });
        });
        if(choice)
          await localApi.deleteListing(this.listing.id);
        this.$emit('cancel');
      } catch(e) {
        const message = 'Error deleting listing: ' + e.message || String(e);
        this.$buefy.notification.open({ type: 'is-danger', hasIcon: true, message });
        console.error(message);
      }

      this.working = false;
    },
    edit() {
      if(this.working) return;
      if(this.owned) {
        this.partial = this.makePartial(this.listing);
        this.editing = true;
      }
    },
    async save() {
      if(this.working) return;
      this.working = true;
      try {
        if(this.listing) {
          // put the old one
          await localApi.updateListing(this.listing.id, this.partial);
        } else if(this.temID) {
          // post the new one
          await localApi.addListing(this.partial);
        }
        this.$emit('cancel');
      } catch(e) {
        const message = 'Error saving listing: ' + e.message || String(e);
        this.$buefy.notification.open({ type: 'is-danger', hasIcon: true, message });
        console.error(message);
      }
      this.working = false;
    },
    cancel() {
      if(this.editing && this.listing)
        this.editing = false;
      else
        this.$emit('cancel');
    }
  }
})
