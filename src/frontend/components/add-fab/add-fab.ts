import Vue from 'vue';
import AutofillComponent from 'frontend/components/autofill-modal/autofill-modal';
import ListingModalComponent from 'frontend/components/listing-modal/listing-modal';

export default Vue.component('tem-add-fab', {
  methods: {
    click() {
      if(this.$route.params.id) {
        this.add(Number(this.$route.params.id));
      } else {
        const m = this.$buefy.modal.open({
          hasModalCard: true,
          component: AutofillComponent,
          parent: this,
          trapFocus: true,
          canCancel: ['x', 'escape'],
          events: {
            confirm: (tem) => { this.add(tem.id); m.close(); },
            cancel: () => { m.close(); }
          }
        });
      }
    },
    add(temID: number) {
      const m = this.$buefy.modal.open({
        hasModalCard: true,
        props: { temID },
        component: ListingModalComponent,
        parent: this,
        trapFocus: true,
        canCancel: ['x', 'escape'],
        events: {
          cancel: () => { m.close(); }
        }
      });
    }
  }
});
