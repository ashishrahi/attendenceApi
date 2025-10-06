// routes/zoneRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {ZoneController} from '../controllers/index';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response) =>
    ZoneController.createZoneController
);

router.put(
  '/update',
  (req: Request, res: Response) =>
    ZoneController.updateZoneController
);

router.get(
  '/',
  (req: Request, res: Response) =>
    ZoneController.getZoneController
);

router.delete(
  '/delete/:id',
  (req: Request<{ id: string }>, res: Response) =>
    ZoneController.deleteZoneController
);

export default router;
