// routes/holidayRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as HoliDayController from '../controllers/HoliDayController';

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    HoliDayController.createHoliday(req, res)
);

router.put(
  '/update/:id',
  (req: Request, res: Response, next: NextFunction) =>
    HoliDayController.updateHoliday(req, res)
);

router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) =>
    HoliDayController.getHolidays(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request, res: Response, next: NextFunction) =>
    HoliDayController.deleteHoliday(req, res)
);

export default router;
