import Vue from 'vue';
import { getTemIcon } from 'common/api/util';
import { PropValidator } from 'vue/types/options';
import { Listing } from 'frontend/data/data';

export default Vue.component('tem-listing-card', {
  props: {
    listing: { type: Object, required: true } as PropValidator<Listing>
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
