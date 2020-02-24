import Vue from 'vue';
import { getTemIcon, makeListing } from 'common/api/util';
import { Temtem, Listing } from 'frontend/data/data';
import localApi from 'frontend/services/local-api';
import { debounce } from 'lodash';
import dataBus from 'frontend/services/data-bus';
import ListingCard from 'frontend/components/listing-card/listing-card';
import TemCard from 'frontend/components/tem-card/tem-card';

const sampleListings: Listing[] = [
  makeListing(),
  makeListing(),
  makeListing(),
  makeListing(),
  makeListing(),
  makeListing(),
  makeListing(),
  makeListing(),
  makeListing(),
  makeListing()
];

export default Vue.component('tem-home', {
  components: { ListingCard, TemCard },
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
    localApi.getRecentListings().then(
      d => this.recent = d.concat(sampleListings),
      e => console.error('Error getting recent listings: ', e));

    this.search = String(this.$route.query.q || '') || '';
    if(this.search)
      this.updateSearch(this.search);
  },
  methods: {
    getTemIcon(temID: number, luma?: boolean): string {
      return '/assets/sprites/' + getTemIcon(temID, luma);
    },
    updateSearch(q: string) { },
    _updateSearch(q: string) {
      this.$router.replace({ path: this.$route.path, query: q ? { q } : { } });
      const qs = q.toLocaleLowerCase().split(/\W/).filter(a => a);
      const scores: { [id: string]: number } = { };
      this.searchResults = dataBus.state.temDB
        .filter(tem => {
          const n = tem.name.toLocaleLowerCase();
          const qpart = qs.find(qp => n.includes(qp));
          if(!qpart) return false;
          scores[tem.id] = n.indexOf(qpart);
          return true;
        })
        .sort((a, b) => scores[a.id] === scores[b.id] ? a.name.localeCompare(b.name) : scores[a.id] - scores[b.id])
        .slice(0, 10);
    }
  }
});
