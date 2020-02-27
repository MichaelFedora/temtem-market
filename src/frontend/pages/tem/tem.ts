import Vue from 'vue';
import { getTemIcon } from 'common/api/util';
import dataBus from 'frontend/services/data-bus';
import { Temtem } from 'frontend/data/data';
import localApi from 'frontend/services/local-api';

export default Vue.component('tem-tem', {
  data() {
    return {
      listings: [],
    }
  },
  computed: {
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
  mounted() {
    localApi.getListingsForTem(this.$route.params.id)
      .then(v => this.listings = v,
        e => console.error('Error getting listings for tem: ', e.message || e));
  },
  methods: {
    getTemIcon(temID: number, luma?: boolean): string {
      return '/assets/sprites/' + getTemIcon(temID, luma);
    },
    getStatClass(stat: number) {
      if(stat < 33) return 'stat-red';
      if(stat < 66) return 'stat-orange';
      if(stat < 100) return 'stat-green';
      return 'stat-blue';
    }
  }
});
