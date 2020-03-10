import Vue from 'vue';
import { getTemIcon } from 'common/api/util';
import { Temtem, Listing } from 'frontend/data/data';
import localApi from 'frontend/services/local-api';
import { debounce } from 'lodash';
import dataBus from 'frontend/services/data-bus';
import ListingCard from 'frontend/components/listing-card/listing-card';
import TemCard from 'frontend/components/tem-card/tem-card';
import ListingModalComponent from 'frontend/components/listing-modal/listing-modal';

export default Vue.component('tem-home', {
  components: { ListingCard, TemCard },
  data() {
    return {
      show: 'home' as 'home' | 'search',
      search: '',
      searchResults: [] as Temtem[],
      recent: [] as Listing[],
      working: false,
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
    this.refresh();

    this.search = String(this.$route.query.q || '') || '';
    if(this.search)
      this.updateSearch(this.search);
  },
  methods: {
    getTemIcon(temID: number, luma?: boolean): string {
      return '/assets/sprites/' + getTemIcon(temID, luma);
    },
    async refresh() {
      if(this.working) return;
      this.working = true;
      await localApi.getRecentListings().then(
        d => this.recent = d,
        e => console.error('Error getting recent listings: ', e));
      this.working = false;
    },
    click(listing: Listing) {
      console.log('Clicked listing: ' + listing.id + ' from user ' + listing.user);
      const m = this.$buefy.modal.open({
        hasModalCard: true,
        props: { listing },
        component: ListingModalComponent,
        parent: this,
        trapFocus: true,
        canCancel: ['x', 'escape'],
        events: {
          cancel: () => { m.close(); this.refresh(); }
        }
      });
    },
    updateSearch(q: string) { },
    _updateSearch(q: string) {
      this.$router.replace({ path: this.$route.path, query: q ? { q } : { } });
      const qs = q.toLocaleLowerCase().split(/\W/).filter(a => a);
      const scores: { [id: string]: number } = { };
      this.searchResults = dataBus.state.temDB
        .filter(tem => {
          const strs = tem.type.map(a => a.toLocaleLowerCase());
          strs.unshift(tem.name.toLocaleLowerCase());

          for(const qp of qs) {
            for(let i = 0, s = strs[i]; i < strs.length; i++, s = strs[i]) {
              const loc = s.indexOf(qp);
              if(loc >= 0) {
                scores[tem.id] = i * 100 + loc;
                return true;
              }
            }
          }
          return false;
        })
        .sort((a, b) => scores[a.id] === scores[b.id] ? a.name.localeCompare(b.name) : scores[a.id] - scores[b.id]);
      // .slice(0, 10);
    }
  }
});
