import 'source-map-support/register';
import configureLogger from './logger';

import * as express from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';
import { getLogger, shutdown } from 'log4js';
import * as fs from 'fs-extra';

import db from './services/db-service';
import api from './services/api-service';
import { Config } from './data/config';

let config: Config;
const production = process.env.NODE_ENV === 'production';

try {
  config = fs.readJsonSync('config.json');
} catch(e) {
  console.error(`Couldn't read config.json! ${e.stack || e}`);
  process.exit(1);
}

configureLogger();

console.log('Initializing Database...');

db.init(config).then(async () => {

  const logger = getLogger('app');
  const httpLogger = getLogger('express');

  const app = express();
  app.set('trust proxy', 1);

  app.use(cors({ origin: '*', methods: 'GET,POST,PUT,DELETE' }));
  app.use(helmet());
  app.use(helmet.referrerPolicy({
    policy: 'no-referrer-when-downgrade'
  }));

  app.use(helmet.contentSecurityPolicy({
    directives: production ? {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'https://cdn.discordapp.com/']
    } : {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\'', '\'unsafe-eval\''],
      imgSrc: ['\'self\'', 'https://cdn.discordapp.com/']
    }
  }));

  app.use((req, res, next) => {
    const host = req.headers.origin || req.headers.host || req.ip;
    httpLogger.info(`${req.method} ${req.hostname}${req.originalUrl} from ${host} (ip: ${req.ip}, ips: [${req.ips}])`);
    next();
  });

  api.init(config);

  app.use('/', api.router);

  app.use((err, req, res, next) => {
    httpLogger.error('Express caught an error!', err);
    res.status(500).json({ message: 'Something broke!' });
  });

  logger.info('== Initialized! ==');
  console.log(`Listening on ${config.ip}:${config.port}!`);

  app.listen(config.port, config.ip);

}, err => {
  console.log('Failed to initialize the database: ' + err);
  if(err.stack)
    console.log(err.stack);
  process.exit(1);
}).catch(err => {
  console.error('Temtem-Market.js caught an error!');
  console.error(err);
  shutdown((e) => {
    if(e) {
      console.error('**ERROR SHUTTING DOWN LOG4JS**');
      console.error(e);
    }
    process.exit(1);
  });
});

process.on('unhandledRejection', err => {
  console.error('**UNHANDLED REJECTION**');
  console.error(err);
  shutdown((e) => {
    if(e) {
      console.error('**ERROR SHUTTING DOWN LOG4JS**');
      console.error(e);
    }
    process.exit(1);
  });
});

process.on('exit', () => {
  console.log('Shutting down...');
  shutdown(e => {
    if(e) {
      console.error('**ERROR SHUTTING DOWN LOG4JS**');
      console.error(e);
    }
  });
  db.close().catch(e => {
    if(e) {
      console.error('**ERROR CLOSING DB**');
      console.error(e);
    }
  });
});
