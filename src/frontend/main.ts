import Vue from 'vue';
import { ValidationProvider } from 'vee-validate';
import Buefy from 'buefy';

import AppComponent from './app/app';
import LoadingComponent from './components/loading/loading';

import '@mdi/font/css/materialdesignicons.css';
import './buefy.scss';
import './styles.scss';
import router from './router';
import { makeInitializerComponent } from './services/render-util';
import localApi from './services/local-api';
import dataBus from './services/data-bus';

console.log('Environment:', process.env.NODE_ENV);

Vue.use(Buefy);

const v = new Vue({
  router,
  el: '#app',
  components: { AppComponent, ValidationProvider },
  data: { loaded: false },
  render(h) {
    if(this.loaded) {
      return h(AppComponent, { key: 'app' });
    } else return makeInitializerComponent(h, LoadingComponent);
  }
});

(async () => {
  if(v.$route.query.sid) {
    localApi.sid = String(v.$route.query.sid || localApi.sid || '');
    v.$router.replace(v.$route.path);
  }

  if(localApi.sid) {
    await localApi.getSelf().then(u => dataBus.setUser(u), e => {
      localApi.sid = '';
      dataBus.setUser(null);
      console.error('Error getting self: ', e.message || e);
    });
    await localApi.heartbeat().catch(() => { });
  }

  dataBus.state.temDB = await localApi.getAllTem();

})().then(() => {
  console.log('Initialized Main!');
  v.loaded = true;
}, e => {
  console.error('Error initializing main: ', e.stack || e.message || e);
  v.$buefy.dialog.alert({
    title: 'Error',
    message: 'Error initializing main: ' + String(e.message || e),
    type: 'is-danger'
  });
});
