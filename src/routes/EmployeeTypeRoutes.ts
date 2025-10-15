import { Router, Request, Response, NextFunction } from 'express';
import {EmployeeTypeController} from '../controllers/index';

const router = Router();

router.post(
  '/',
  (req: Request, res: Response) =>
    EmployeeTypeController.createEmployeeTypeController(req, res)
);

router.put(
  '/:id',
  (req: Request, res: Response) =>
    EmployeeTypeController.updateEmployeeTypeController(req, res)
);

router.get(
  '/',
  (req: Request, res: Response) =>
    EmployeeTypeController.getEmployeeTypesController(req, res)
);

router.delete(
  '/:id',
  (req: Request, res: Response) =>
    EmployeeTypeController.deleteEmployeeTypeController(req, res)
);

export default router;
