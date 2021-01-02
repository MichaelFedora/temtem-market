import Vue from 'vue';
import { getTemIcon } from 'common/api/util';
import { PropValidator } from 'vue/types/options';
import { Listing } from 'frontend/data/data';

export default Vue.component('tem-listing-table', {
  props: {
    listings: { type: Array, required: true } as PropValidator<Listing[]>,
    extended: Boolean
  },
  data() {
    return {
      hover: '',
    };
  },
  computed: {
    hasEvo(): boolean { return Boolean(this.listings.find(l => l.score_evo)); }
  },
  methods: {
    getTemIcon(temID: number, luma?: boolean): string {
      return '/assets/sprites/' + getTemIcon(temID, luma);
    },
    getStatusIcon(status: 'online' | 'in_game' | 'offline') {
      switch(status) {
        case 'online': return 'web';
        case 'in_game': return 'gamepad-variant';
        case 'offline': return 'sleep';
        default: return 'help';
      }
    },
  }
});
