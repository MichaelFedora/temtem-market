import Vue from 'vue';
import { PropValidator } from 'vue/types/options';
import { Listing, PartialListing, Temtem } from 'frontend/data/data';
import dataBus from 'frontend/services/data-bus';
import { getTemIcon } from 'common/api/util';

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
      if(this.partial.level <= 0) return 'Level is <= 0!';
      if(!this.partial.type) return 'No listing type!';
      if(Object.values(this.partial.svs).find(a => !a || a <= 0 || a > 50)) return 'Some SVs are missing or out of bounds!'
      if(Object.values(this.partial.tvs).find(a => !a || a < 0 || a > 500)) return 'Some TVs are out of bounds!';
      if(Object.values(this.partial.tvs).reduce((acc, c) => acc + c, 0) > 1000) return 'TVs sum to over 1000!';
      if(this.partial.price <= 0) return 'Price is <= 0!';
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
    edit() {
      if(this.owned) {
        this.partial = this.makePartial(this.listing);
        this.editing = true;
      }
    },
    save() {
      if(this.listing) {
        // put the old one
      } else if(this.temID) {
        // post the new one
      }
    },
    cancel() {
      if(this.editing && this.listing)
        this.editing = false;
      else
        this.$emit('cancel');
    }
  }
})
