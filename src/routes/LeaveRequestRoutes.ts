// routes/leaveRequestRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as LeaveRequestController from '../controllers/LeaveRequestController';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveRequestController.applyLeave(req, res)
);

router.put(
  '/update/:id',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveRequestController.updateLeaveStatus(req, res)
);

router.post(
  '/all/:id',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveRequestController.getAllLeaveApplications(req, res)
);

router.get(
  '/:id',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveRequestController.getLeaveApplicationById(req, res)
);

router.get(
  '/getmyleave/:id',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveRequestController.getMyLeaveApplications(req, res)
);

router.get(
  '/getpendingleave/:id',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveRequestController.getPendingLeaveApplications(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveRequestController.deleteLeaveApplication(req, res)
);

export default router;
