import { Router, Request, Response, NextFunction } from 'express';
import {departmentController} from '../controllers/index';

const router = Router();

router.post('/', (req: Request, res: Response, next: NextFunction) =>
  departmentController.createDepartment(req, res)
);

router.put('/:id', (req: Request, res: Response, next: NextFunction) =>
  departmentController.updateDepartment(req, res)
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  departmentController.getDepartment(req, res)
);

router.delete('/:id', (req: Request, res: Response, next: NextFunction) =>
  departmentController.deleteDepartment(req, res)
);

export default router;
