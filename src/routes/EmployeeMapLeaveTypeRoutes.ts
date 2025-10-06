// routes/employeeMapLeaveTypeRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as EmployeeMapLeaveTypeController from '../controllers/EmployeeMapLeaveTypeController';

const router = Router();


router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    EmployeeMapLeaveTypeController.createLeaveMappings(req, res)
);



router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) =>
    EmployeeMapLeaveTypeController.getAllLeaveMappings(req, res)
);

router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) =>
    EmployeeMapLeaveTypeController.getMappedLeaveTypes(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request, res: Response, next: NextFunction) =>
    EmployeeMapLeaveTypeController.deleteAllLeaveMappings(req, res)
);

export default router;
