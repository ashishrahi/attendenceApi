// routes/deviceRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as DeviceController from '../controllers/DeviceController';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  DeviceController.getGender(req, res, next)
);

export default router;
