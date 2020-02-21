import Vue from 'vue';
import VueRouter from 'vue-router';

import HomePage from './pages/home/home';
import TemPage from './pages/tem/tem';
import MePage from './pages/me/me';
import NotFoundPage from './pages/not-found/not-found';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: HomePage }, // recent listings, search tem
    { path: '/tem/:id', component: TemPage }, // tem listings, popup for listing details
    { path: '/me', component: MePage }, // own listings
    // { path: '/u/:id', component UserPage }, // other user's listings
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
