import { Router } from 'express';
import { Logger } from 'log4js';
import { validateSession, wrapAsync } from './middleware';
import { Config } from '../../data/config';
import dbService from '../db-service';
import { AuthError, MalformedError } from '../../data/errors';
import axios from 'axios';
import { User, userStatusType } from '../../data/user';

export default function createUserApi(logger: Logger, config: Config) {
  const router = Router();

  router.post('/login', (req, res) => {
    res.redirect('https://discordapp.com/api/oauth2/authorize'
    + `?client_id=${config.clientID}&scope=identify`
    + `&response_type=code&scope=identify&redirect_uri=${config.redirectUri}`);
  });
  router.get('/discord_auth', wrapAsync(async (req, res) => {
    if(!req.query.code) throw new AuthError('No code given!');
    const creds = Buffer.from(`${config.clientID}:${config.clientSecret}`).toString('base64');
    const authInfoRes = await axios.post('https://discordapp.com/api/oauth2/token'
    + `?grant_type=authorization_code&code=${req.query.code}`
    + `&redirect_uri=${config.redirectUri}&scope=identify`, null, { headers: { Authorization: `Basic ${creds}` } });

    const token = authInfoRes.data.access_token;
    // const refreshToken = authInfoRes.data.refresh_token;

    const userInfoRes = await axios.get('https://discordapp.com/api/users/@me', { headers: 'Bearer ' + token });
    const userInfo: { id: string; username: string; discriminator: string; avatar: string } = userInfoRes.data;

    // go ahead and revoke it when we're done
    await axios.post('https://discordapp.com/api/oauth2/token/revoke', { headers: 'Bearer ' + token });

    const sid = await dbService.sessions.create(userInfo.id);

    const user = await dbService.users.get(userInfo.id);
    if(user) {
      user.discordAvatar = userInfo.avatar;
      user.discordName = userInfo.username + '#' + userInfo.discriminator;
      await dbService.users.update(user);
    } else {
      res.redirect('/register'
      + `?avatar=${JSON.stringify(userInfo.avatar)}`
      + `&name=${JSON.stringify(userInfo.username)}`
      + `&sid=${JSON.stringify(sid)}`);
    }
  }));
  router.post('/register', validateSession(), wrapAsync(async (req, res) => {
    if(!req.body.name) throw new MalformedError('No discord name!');
    if(!req.body.temUserName) throw new MalformedError('No Temtem username!');
    if(!req.body.temUserID) throw new MalformedError('No Temtem userID!');

    await dbService.users.register(req.query.sid, req.body.avatar, req.body.name, req.body.temUserName, req.body.temUserID);
    res.sendStatus(204);
  }));
  router.post('/logout', validateSession(), wrapAsync(async (req, res) => {
    await dbService.sessions.delete(req.query.sid);
    res.sendStatus(204);
  }));
  router.delete('/', validateSession(), wrapAsync(async (req, res) => {
    await dbService.users.delete((req as any).user.id);
    res.sendStatus(204);
  }));
  router.get('/gdpr', validateSession(), wrapAsync(async (req, res) => {
    const user: User = (req as any).user;
    const sessions = (await dbService.sessions.getAllForUser(user.id)).forEach(a => delete a.userID);
    const listings = (await dbService.listings.getForUser(user.id)).forEach(a => delete a.userID);
    res.json(Object.assign({ }, user, { sessions, listings }));
  }));
  router.put('/status', validateSession(), wrapAsync(async (req, res) => {
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
