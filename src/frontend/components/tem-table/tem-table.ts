import Vue from 'vue';
import { getTemIcon } from 'common/api/util';
import { PropValidator } from 'vue/types/options';
import { Temtem } from 'frontend/data/data';

export default Vue.component('tem-tem-table', {
  props: {
    tems: { type: Array, required: true } as PropValidator<Temtem[]>
  },
  data() {
    return {
      hover: '',
    };
  },
  methods: {
    getTemIcon(temID: number, luma?: boolean): string {
      return '/assets/sprites/' + getTemIcon(temID, luma);
    }
  }
});
