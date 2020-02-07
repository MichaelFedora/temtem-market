import { Router } from 'express';
import { Logger } from 'log4js';
import { handleError, handleValidationError, validateSession, wrapAsync } from './middleware';

// register/login/logout/gdpr

// also, messaging?

export default function createTemApi(logger: Logger) {
  const router = Router();

  router.get('');
  router.get('/search');

  router.get('/listings');
  router.post('/my/listings');
  router.get('/my/listings');
  router.get('/my/listings/:id');
  router.put('/my/listings/:id');
  router.delete('/my/listings/:id');

  return router;
}
