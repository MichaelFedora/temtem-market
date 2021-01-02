import Vue from 'vue';

import localApi from 'frontend/services/local-api';
import { Temtem } from 'frontend/data/data';

import TemTableComponent from 'frontend/components/tem-table/tem-table';

export default Vue.component('tem-tems', {
  components: { TemTableComponent } ,
  data() { return {
    working: false,
    tems: [] as Temtem[]
  }; },
  mounted() { this.refresh(); },
  methods: {

    async refresh() {
      if(this.working) return;
      this.working = true;
      await localApi.getAllTem().then(
        d => this.tems = d,
        e => console.error('Error getting tems: ', e));
      this.working = false;
    },
    click(tem: Temtem) {
      console.log('Clicked tem: ' + tem.id);
      this.$router.push('/tem/' + tem.id);
    }
  }
});
