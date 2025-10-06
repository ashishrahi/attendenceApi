// routes/holidayRoutes.ts
import { Router, Request, Response } from 'express';
import {HoliDayController} from '../controllers/index';

const router = Router();

router.post(
  '/',
  (req: Request, res: Response) =>
    HoliDayController.createHolidayController
);

router.put(
  '/:id',
  (req: Request, res: Response) =>
    HoliDayController.updateHolidayController
);

router.get(
  '/',
  (req: Request, res: Response) =>
    HoliDayController.getHolidaysController
);

router.delete(
  '/:id',
  (req: Request, res: Response) =>
    HoliDayController.deleteHolidayController
);

export default router;
