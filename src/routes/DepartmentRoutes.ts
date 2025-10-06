// routes/deptRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {departmentController} from '../controllers/index';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post('/create', (req: Request, res: Response, next: NextFunction) =>
  departmentController.createDepartment(req, res)
);

router.put('/update/:id', (req: Request, res: Response, next: NextFunction) =>
  departmentController.updateDepartment(req, res)
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  departmentController.getDepartment(req, res)
);

router.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) =>
  departmentController.deleteDepartment(req, res)
);

export default router;
