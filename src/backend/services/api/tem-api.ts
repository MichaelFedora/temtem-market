import { Router } from 'express';
import { Logger } from 'log4js';
import { validateSession, wrapAsync } from './middleware';
import dbService from '../db-service';
import { NotAllowedError } from '../../data/errors';
import { listing_types } from '../../util';

// register/login/logout/gdpr

// also, messaging?

export default function createTemApi(logger: Logger) {
  const router = Router();

  router.get('/', wrapAsync(async (req, res) => {
    res.json(await dbService.temdata.getAll());
  }));

  router.get('/search', wrapAsync(async (req, res) => {
    const limit = (req.query.limit && Number(req.query.limit)) || undefined;
    const start = (req.query.start && Number(req.query.start)) || undefined;
    res.json(await dbService.temdata.search(req.query.q, limit, start));
  }));

  router.get('/listings/tem/:temID', wrapAsync(async (req, res) => {
    const opts: { start?: number; limit?: number; type?: any } = { };
    if(req.query.start)
      opts.start = Math.max(0, Number(req.query.start) || 0);
    if(req.query.limit)
      opts.limit = Math.max(0, Math.min(100, Number(req.query.limit) || 100));
    if(req.query.type && listing_types.includes(req.query.type))
      opts.type = req.query.type;
    res.json(await dbService.listings.getForTem(req.params.temID, opts));
  }));
  router.get('/listings/user/:id', wrapAsync(async (req, res) => {
    res.json(await dbService.listings.getForUser(req.params.id));
  }));
  router.get('/listings/recent', wrapAsync(async (req, res) => {
    res.json(await dbService.listings.getRecent());
  }));
  router.get('/listings/:id', wrapAsync(async (req, res) => {
    res.json(await dbService.listings.get(req.params.id));
  }));


  router.get('/my/listings', validateSession(), wrapAsync(async (req, res) => {
    res.json(await dbService.listings.getForUser((req as any).user.id));
  }));
  router.post('/my/listings', validateSession(), wrapAsync(async (req, res) => {
    res.json(await dbService.listings.add((req as any).user.id, req.body));
  }));
  router.put('/my/listings/:id', validateSession(), wrapAsync(async (req, res) => {
    const listing = await dbService.listings.get(req.params.id);
    if(!listing || listing.userID !== (req as any).user.id)
      throw new NotAllowedError('ID is not owned by user!');

    await dbService.listings.update(req.params.id, (req as any).user.id, req.body);
    res.sendStatus(204);
  }));
  router.delete('/my/listings/:id', validateSession(), wrapAsync(async (req, res) => {
    const listing = await dbService.listings.get(req.params.id);
    if(!listing || listing.userID !== (req as any).user.id)
      throw new NotAllowedError('ID is not owned by user!');

    await dbService.listings.delete(req.params.id);
  }));

  return router;
}
