import Vue from 'vue';
import VueRouter from 'vue-router';

import HomePage from './pages/home/home';
import TemPage from './pages/tem/tem';
import UserPage from './pages/user/user';
import PrivacyPage from './pages/privacy/privacy';
import NotFoundPage from './pages/not-found/not-found';
import dataBus from './services/data-bus';
import localApi from './services/local-api';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: HomePage }, // recent listings, search tem
    { path: '/tem/:id', component: TemPage }, // tem listings, popup for listing details
    { path: '/me', redirect: () => {
      if(dataBus.state.user && dataBus.state.user.id && localApi.sid)
        return '/user/' + dataBus.state.user.id;
      else return '/';
    } },
    { path: '/user/:uid', component: UserPage }, // other user's listings
    { path: '/privacy', component: PrivacyPage },
    { path: '**', component: NotFoundPage }
  ]
});

router.beforeEach((to, from, next) => {
  if(to.path !== from.path) {
    if(to.path.length > 1) {

      const sdir = [];
      let buff = '';
      to.path.slice(1).split('/').forEach(v => {
        if(!v) buff += '/';
        else if(buff) sdir.push(buff + v);
        else sdir.push(v);
      });

      document.title = 'Temtem Market - ' + sdir.join(' - ');
    } else document.title = 'Temtem Market';
  }
  next();
});

export default router;
