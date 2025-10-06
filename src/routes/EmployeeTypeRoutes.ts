// routes/employeeTypeRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as EmployeeTypeController from '../controllers/EmployeeTypeController';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    EmployeeTypeController.createEmployeeType(req, res)
);

router.put(
  '/update/:id',
  (req: Request, res: Response, next: NextFunction) =>
    EmployeeTypeController.updateEmployeeType(req, res)
);

router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) =>
    EmployeeTypeController.getEmployeeTypes(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request, res: Response, next: NextFunction) =>
    EmployeeTypeController.deleteEmployeeType(req, res)
);

export default router;
