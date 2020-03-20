import { Router, text, json } from 'express';
import { Logger } from 'log4js';
import { validateSession, wrapAsync } from './middleware';
import { Config } from '../../data/config';
import dbService from '../db-service';
import { AuthError, MalformedError } from '../../data/errors';
import axios, { AxiosError } from 'axios';
import { User, userStatusType } from '../../data/user';

export default function createUserApi(logger: Logger, config: Config) {
  const router = Router();

  router.get('/login', (_, res) => {
    res.redirect('https://discordapp.com/api/oauth2/authorize'
    + `?client_id=${config.clientID}&scope=identify`
    + `&response_type=code&redirect_uri=${config.redirectUri}`);
  });
  router.get('/discord_auth', wrapAsync(async (req, res) => {
    if(!req.query.code) throw new AuthError('No code given!');
    const creds = Buffer.from(`${config.clientID}:${config.clientSecret}`).toString('base64');
    let authInfoRes: any;
    try {
      authInfoRes = await axios.post('https://discordapp.com/api/oauth2/token'
        + `?grant_type=authorization_code&code=${req.query.code}`
        + `&redirect_uri=${config.redirectUri}&scope=identify`, null, { headers: { Authorization: `Basic ${creds}` } });
    } catch(e) {
      console.error('Error posting auth code for token: ', e.message || e);
      res.sendStatus(500);
      return;
    }

    const token = authInfoRes.data.access_token;
    // const refreshToken = authInfoRes.data.refresh_token;

    let userInfoRes: any;
    try {
      userInfoRes = await axios.get('https://discordapp.com/api/users/@me', { headers: { Authorization: 'Bearer ' + token } });
    } catch(e) {
      console.error('Error getting @me: ', e.message || e);
      res.sendStatus(500);
      return;
    }
    const userInfo: { id: string; username: string; discriminator: string; avatar: string } = userInfoRes.data;

    // go ahead and revoke it when we're done
    /* try { // not working *shrug*
      await axios.post('https://discordapp.com/api/oauth2/token/revoke', { headers: { Authorization: 'Bearer ' + token } });
    } catch(e) {
      console.error('Error posting discord token revoke: ', e.message || e);
    } */

    const sid = await dbService.sessions.create(userInfo.id);

    const user = await dbService.users.get(userInfo.id);
    if(user) {
      user.discordAvatar = `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}`;
      user.discordName = userInfo.username + '#' + userInfo.discriminator;
      await dbService.users.update(user);
    } else {
      const encodedName = Buffer.from(`${userInfo.username}#${userInfo.discriminator}`).toString('base64');
      res.redirect(`/?register=${sid}&name=${encodedName}`
        + `&avatar=https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`);
      return;
    }

    res.redirect(`/?sid=${sid}`);
  }));
  router.post('/register', json(), wrapAsync(async (req, res) => {
    if(!req.body.name) throw new MalformedError('No discord name!');
    if(!req.body.temUserName) throw new MalformedError('No Temtem username!');
    if(!req.body.temUserID) throw new MalformedError('No Temtem userID!');

    const sess = await dbService.sessions.get(req.query.sid);

    await dbService.users.register(sess.userID, req.body.avatar, req.body.name, req.body.temUserName, req.body.temUserID);
    res.sendStatus(204);
  }));
  router.post('/logout', validateSession(), wrapAsync(async (req, res) => {
    await dbService.sessions.delete(req.query.sid);
    res.sendStatus(204);
  }));
  router.get('/', validateSession(), wrapAsync(async (req, res) => {
    res.json((req as any).user);
  }));
  router.put('/tem-info', validateSession(), json(), wrapAsync(async (req, res) => {
    if(!req.body.temUserName && !req.body.temUserID) {
      res.sendStatus(400);
      return;
    }

    const user: User = (req as any).user;
    await dbService.users.updateTemInfo(
      user.id,
      req.body.temUserName || user.temUserName,
      req.body.temUserID || user.temUserID);
    res.sendStatus(204);
  }));
  router.delete('/', validateSession(), wrapAsync(async (req, res) => {
    await dbService.users.delete((req as any).user.id);
    res.sendStatus(204);
  }));
  router.get('/gdpr', validateSession(), wrapAsync(async (req, res) => {
    const user: User = (req as any).user;
    const sessions = (await dbService.sessions.getAllForUser(user.id));
    const listings = (await dbService.listings.getForUser(user.id));
    for(const sess of sessions) delete sess.userID;
    for(const list of listings) {
      delete list.userID;

      if(list.user)
        delete list.user;
      if(list.avatar)
        delete list.avatar;
      if(list.status)
        delete list.status;
    }
    res.json(Object.assign({ }, user, { sessions, listings }));
  }));
  router.put('/status', text(), validateSession(), wrapAsync(async (req, res) => {
    logger.info('put status: ', req.body);
    if(userStatusType.includes(req.body)) {
      const user: User = (req as any).user;
      user.status = req.body;
      await dbService.users.update(user);
      res.sendStatus(204);
    } else
      res.sendStatus(400);
  }));
  router.post('/heartbeat', validateSession(), wrapAsync(async (req, res) => {
    const user: User = (req as any).user;
    user.heartbeat = Date.now();
    await dbService.users.update(user);
    res.sendStatus(204);
  }));

  return router;
}
