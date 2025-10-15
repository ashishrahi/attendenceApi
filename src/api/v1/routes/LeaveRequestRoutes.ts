// routes/leaveRequestRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {LeaveRequestController} from '../controllers/index';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post(
  '/',
  (req: Request, res: Response) =>
    LeaveRequestController.createLeaveController(req, res)
);

router.put(
  '/:id',
  (req: Request, res: Response) =>
    LeaveRequestController.updateLeaveStatusController(req, res)
);

router.get(
  '/',
  (req: Request, res: Response) =>
    LeaveRequestController.getAllLeaveApplicationsController(req, res)
);

router.get(
  '/:id',
  (req: Request, res: Response) =>
    LeaveRequestController.getLeaveApplicationByIdController(req, res)
);



router.delete(
  '/:id',
  (req: Request, res: Response) =>
    LeaveRequestController.deleteLeaveApplicationController(req, res)
);

export default router;
