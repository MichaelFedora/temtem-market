import Vue from 'vue';
import { ValidationProvider } from 'vee-validate';
import Buefy from 'buefy';

import AppComponent from './app/app';

import '@mdi/font/css/materialdesignicons.css';
import './buefy.scss';
import './styles.scss';
import router from './router';

console.log('Environment:', process.env.NODE_ENV);

Vue.use(Buefy);

const v = new Vue({
  router,
  el: '#app',
  components: { AppComponent, ValidationProvider },
  data: { loaded: false, done: true, working: false },
  render(h) {
    return h(AppComponent, { key: 'app' });
  }
});

// any async loading here, then the following:
console.log('Initialized Main!');
v.loaded = true;
