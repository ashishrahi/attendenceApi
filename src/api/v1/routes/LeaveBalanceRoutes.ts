// routes/leaveBalanceRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {LeaveBalanceController} from '../controllers/index';

const router = Router();

router.post(
  '/',
  (req: Request, res: Response) =>
    LeaveBalanceController.createLeaveBalanceController(req, res)
);

router.put(
  '/:id',
  (req: Request, res: Response) =>
    LeaveBalanceController.updateLeaveBalanceController(req, res)
);

router.post(
  '/',
  (req: Request, res: Response) =>
    LeaveBalanceController.getLeaveBalanceController(req, res)
);

router.delete(
  '/:id',
  (req: Request, res: Response) =>
    LeaveBalanceController.deleteLeaveBalanceController(req, res)
);

export default router;
