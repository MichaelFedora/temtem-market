import { Router, static as serveStatic } from 'express';
import * as path from 'path';

import { Config } from '../data/config';
import { handleError } from './api/middleware';

import createUserApi from './api/user-api';
import createTemApi from './api/tem-api';
import { getLogger } from 'log4js';

class Api {

  private _router: Router = Router();
  public get router(): Router { return this._router; }

  private logger = getLogger('services.api');


  public init(config: Config) {


    this.router.use('/',
      serveStatic(path.join(__dirname, '..', '..', 'frontend')),
      serveStatic(path.join(__dirname, '..', '..', 'common/static-serve')));
    this.router.use('/api', (req, res) => res.json({ 'message': 'hello world!' }));
    this.router.use('/api/user', createUserApi(this.logger, config), handleError('user'));
    this.router.use('/api/tem', createTemApi(this.logger), handleError('connection'));
    this.router.use('*', (_, res) => res.sendFile(path.join(__dirname, '..', '..', 'frontend/index.html')));

  }
}

export default new Api();
