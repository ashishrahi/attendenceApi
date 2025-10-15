// routes/helpRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {HelpController} from '../controllers/index';

const router = Router();

router.post(
  '/',
  (req: Request, res: Response, next: NextFunction) =>
    HelpController.createHelpCreationController(req, res)
);

router.put(
  '/:id',
  (req: Request, res: Response, next: NextFunction) =>
    HelpController.updateHelpCreationController(req, res)
);

router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) =>
    HelpController.getHelpCreationController(req, res)
);

router.delete(
  '/:id',
  (req: Request, res: Response, next: NextFunction) =>
    HelpController.deleteHelpCreationController(req, res)
);

export default router;
