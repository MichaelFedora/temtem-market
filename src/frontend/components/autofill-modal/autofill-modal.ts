import Vue from 'vue';
import dataBus from 'frontend/services/data-bus';
import { Temtem } from 'frontend/data/data';

export default Vue.component('tem-autofill-modal', {
  data() {
    const randomTem = dataBus.state.temDB[Math.floor(Math.random() * dataBus.state.temDB.length)];
    return {
      state: dataBus.state,
      search: '',

      randomTem,
    };
  },
  computed: {
    searchResults(): Temtem[] {
      return this.state.temDB
        .map<[Temtem, number]>(tem => [tem, tem.name.toLowerCase().indexOf(this.search.toLowerCase())])
        .filter(([tem, idx]) => idx >= 0)
        .sort(([temA, idxA], [temB, idxB]) => idxA - idxB)
        .map(([tem, idx]) => tem);
    }
  },
  watch: {
    search(n) {
      if(!n)
        this.makeRandomTem();
    }
  },
  methods: {
    makeRandomTem() {
      this.randomTem = this.state.temDB[Math.floor(Math.random() * this.state.temDB.length)];
    }
  }
});
