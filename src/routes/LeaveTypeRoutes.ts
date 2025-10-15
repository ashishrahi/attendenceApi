// routes/leaveTypeRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {LeaveTypeController} from '../controllers/index';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post(
  '/',
  (req: Request, res: Response) =>
    LeaveTypeController.createLeaveTypeController(req, res)
);

router.put(
  '/:id',
  (req: Request, res: Response) =>
    LeaveTypeController.updateLeaveTypeController(req, res)
);

router.get(
  '/',
  (req: Request, res: Response) =>
    LeaveTypeController.getLeaveTypesController(req, res)
);

router.delete(
  '/:id',
  (req: Request, res: Response) =>
    LeaveTypeController.deleteLeaveTypeController(req, res)
);

export default router;
