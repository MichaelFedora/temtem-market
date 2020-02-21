import Vue from 'vue';
import { getTemIcon } from 'common/api/util';
import { Temtem, Listing } from 'frontend/data/data';
import temApi from 'frontend/services/tem-api';
import { debounce } from 'lodash';
import dataBus from 'frontend/services/data-bus';

export default Vue.component('tem-home', {
  data() {
    return {
      show: 'home' as 'home' | 'search',
      search: '',
      searchResults: [] as Temtem[],
      recent: [] as Listing[]
    };
  },
  watch: {
    search(n, o) {
      if(n !== o)
        this.updateSearch(n);
    }
  },
  async mounted() {
    this.updateSearch = debounce(this._updateSearch, 300);
    temApi.getRecentListings().then(
      d => this.recent = d,
      e => console.error('Error getting recent listings: ', e));

    this.search = String(this.$route.query.q || '') || '';
    if(this.search)
      this.updateSearch(this.search);
  },
  methods: {
    getTemIcon(temID: number, luma?: boolean): string {
      return '/assets/' + getTemIcon(temID, luma);
    },
    getStatusIcon(status: 'online' | 'in_game' | 'offline') {
      switch(status) {
        case 'online': return 'web';
        case 'in_game': return 'gamepad-variant';
        case 'offline': return 'sleep';
        default: return 'help';
      }
    },
    updateSearch(q: string) { },
    _updateSearch(q: string) {
      this.$router.replace({ path: this.$route.path, query: q ? { q } : { } });
      const qs = q.toLocaleLowerCase().split(/\W/).filter(a => a);
      const scores: { [id: string]: number } = { };
      this.searchResults = dataBus.temDB
        .filter(tem => {
          const n = tem.name.toLocaleLowerCase();
          const qpart = qs.find(qp => n.includes(qp));
          if(!qpart) return false;
          scores[tem.id] = n.indexOf(qpart);
          return true;
        })
        .sort((a, b) => scores[a.id] - scores[b.id])
        .slice(0, 10);
    }
  }
});
