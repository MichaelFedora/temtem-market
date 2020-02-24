import Vue from 'vue';
import { PropValidator } from 'vue/types/options';
import { Temtem } from 'frontend/data/data';
import { getTemIcon } from 'common/api/util';

export default Vue.component('tem-tem-card', {
  props: { tem: { type: Object, required: true } as PropValidator<Temtem> },
  methods: {
    getTemIcon(temID: number, luma?: boolean): string {
      return '/assets/sprites/' + getTemIcon(temID, luma);
    }
  }
});
