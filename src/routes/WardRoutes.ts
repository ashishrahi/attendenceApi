// routes/wardRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as WardController from '../controllers/WardController';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    WardController.createWard(req, res)
);

router.put(
  '/update',
  (req: Request, res: Response, next: NextFunction) =>
    WardController.updateWard(req, res)
);

router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) =>
    WardController.getWard(req, res,)
);

router.delete(
  '/delete/:id',
  (req: Request<{ id: string }>, res: Response) =>
    WardController.deleteWard(req, res)
);

export default router;
