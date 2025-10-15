// routes/userRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {EmployeeController} from '../controllers/index';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post(
  '/',
  (req: Request, res: Response) =>
    EmployeeController.createEmployeeController(req, res)
);

router.put(
  '/:id',
  (req: Request<{ id: string }>, res: Response) =>
    EmployeeController.updateEmployeeController(req, res)
);

router.get(
  '/:id',
  (req: Request, res: Response) =>
    EmployeeController.getEmployeeController(req, res)
);

router.delete(
  '/:id',
  (req: Request<{ id: string }>, res: Response) =>
    EmployeeController.deleteEmployeeController(req, res)
);

export default router;
