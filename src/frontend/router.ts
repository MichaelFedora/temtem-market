import Vue from 'vue';
import VueRouter from 'vue-router';

import HomePage from './pages/home/home';
const TemPage = () => import('./pages/tem/tem');
const TemsPage = () => import('./pages/tems/tems');
// const ListingsPage = () => import('./pages/listings/listings');
const UserPage = () => import('./pages/user/user');
const PrivacyPage = () => import('./pages/privacy/privacy');
import NotFoundPage from './pages/not-found/not-found';

import dataBus from './services/data-bus';
import localApi from './services/local-api';


Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: HomePage, name: 'home' }, // recent listings, search tem
    { path: '/tem/:id', component: TemPage, name: 'tem' }, // tem listings, popup for listing details
    { path: '/me', redirect: () => {
      if(dataBus.state.user && dataBus.state.user.id && localApi.sid)
        return '/user/' + dataBus.state.user.id;
      else return '/';
    } },
    { path: '/tems', component: TemsPage, name: 'tems' }, // all tem (tables)
    // { path: '/listings', component: ListingsPage, name: 'listings' }, // all listings (tables)
    { path: '/user/:uid', component: UserPage, name: 'user' }, // other user's listings
    { path: '/privacy', component: PrivacyPage, name: 'privacy' },
    { path: '**', component: NotFoundPage, name: 'not-found' }
  ]
});

router.beforeEach((to, from, next) => {
  if(to.path !== from.path) {
    if(to.path.length > 1) {

      const sdir = [];
      let buff = '';
      to.path.slice(1).split('/').forEach(v => {
        if(!v) buff += '/';
        else {
          v = v[0].toLocaleUpperCase() + v.slice(1);
          if(buff) sdir.push(buff + v);
          else sdir.push(v);
        }
      });

      document.title = 'Temtem Market - ' + sdir.join(' - ');
    } else document.title = 'Temtem Market';
  }
  next();
});

export default router;
