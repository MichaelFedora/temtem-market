import { Request, Response, NextFunction } from 'express';
import { getLogger } from 'log4js';
import { User } from '../../data/user';
import { AuthError, NotFoundError, NotAllowedError, MalformedError } from '../../data/errors';
import db from '../db-service';

const logger = getLogger('services.middleware');

export function wrapAsync(func: (req: Request, res?: Response, next?: NextFunction) => Promise<any>) {
  return function(req: Request, res: Response, next: NextFunction) {
    func(req, res, next).catch(next);
  };
}

export function handleValidationError(err: any, req: Request, res: Response, next: NextFunction) {
  if(!err)
    next();

  if(err instanceof AuthError) {
    res.status(403).json({ message: err.message });
  } else {
    logger.error('Error validating token:', err);
    res.status(500).json({ message: 'Failed to validate token.' });
  }
}

export function handleError(action: string) {
  return function(err: any, req: Request, res: Response, next: NextFunction) {
    if(!err) {
      next();
      return;
    }

    logger.debug('Handle Error: ' + err);

    if(err instanceof NotFoundError) {
      res.sendStatus(404);
      return;
    } else if(err instanceof NotAllowedError) {
      res.status(403).json({ message: err.message });
      return;
    } else if(err instanceof MalformedError) {
      res.status(400).json({ message: err.message });
      return;
    } else if(err.type) {
      switch(err.type) {
        case 'not_found_error':
          res.sendStatus(404);
          return;
        case 'not_allowed_error':
          res.sendStatus(403).json({ message: err.message });
          return;
        case 'malformed_error':
          res.status(400).json({ message: err.message });
          return;
      }
    }

    logger.error(`Error performing ${action}: `, err);
    res.status(500).json({ message: `Failed to perform ${action}.` });
  };
}

export function validateSession() {
  return wrapAsync(async function(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await db.sessions.get(req.query.sid || '');
      if(!session)
        throw new AuthError('No session found!');

      const s_user = await db.usersTbl.get(session.userID).run();
      if(!s_user)
        throw new AuthError('No user found!');

      const user = User.deserialize(s_user);
      (req as any).user = user;

    } catch(e) {
      return handleValidationError(e, req, res, next);
    }
    next();
  });
}
