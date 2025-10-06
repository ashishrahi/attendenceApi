// routes/leaveBalanceRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as LeaveBalanceController from '../controllers/LeaveBalanceController';

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveBalanceController.createLeaveBalance(req, res)
);

router.put(
  '/update/:id',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveBalanceController.updateLeaveBalance(req, res)
);

router.post(
  '/',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveBalanceController.getLeaveBalance(req, res)
);

router.post(
  '/getsummary',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveBalanceController.getEmployeeLeaveDetails(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveBalanceController.deleteLeaveBalance(req, res)
);

export default router;
