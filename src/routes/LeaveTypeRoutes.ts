// routes/leaveTypeRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as LeaveTypeController from '../controllers/LeaveTypeController';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveTypeController.createLeaveType(req, res)
);

router.put(
  '/update/:id',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveTypeController.updateLeaveType(req, res)
);

router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveTypeController.getLeaveTypes(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveTypeController.deleteLeaveType(req, res)
);

export default router;
