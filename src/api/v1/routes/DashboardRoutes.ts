// routes/dashboardRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as DashboardController from '../controllers/DashboardController';

const router = Router();

router.post('/', (req: Request, res: Response, next: NextFunction) =>
  DashboardController.Dasboarddata(req, res, next)
);

export default router;
