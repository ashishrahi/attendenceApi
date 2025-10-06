// routes/zoneRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {ZoneController} from '../controllers/index';

const router = Router();

router.post(
  '/',
  (req: Request, res: Response) =>
    ZoneController.createZoneController
);

router.put(
  '/:id',
  (req: Request, res: Response) =>
    ZoneController.updateZoneController
);

router.get(
  '/',
  (req: Request, res: Response) =>
    ZoneController.getZoneController
);

router.delete(
  '/:id',
  (req: Request<{ id: string }>, res: Response) =>
    ZoneController.deleteZoneController
);

export default router;
