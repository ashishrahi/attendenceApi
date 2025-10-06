// routes/zoneRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as ZoneController from '../controllers/ZoneController';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    ZoneController.createZone(req, res)
);

router.put(
  '/update',
  (req: Request, res: Response, next: NextFunction) =>
    ZoneController.updateZone(req, res)
);

router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) =>
    ZoneController.getZone(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request<{ id: string }>, res: Response) =>
    ZoneController.deleteZone(req, res)
);

export default router;
