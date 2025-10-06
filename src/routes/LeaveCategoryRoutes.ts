// routes/leaveCategoryRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as LeaveCategoryController from '../controllers/LeaveCategoryController';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();


router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveCategoryController.createLeaveCategory(req, res)
);

router.put(
  '/update/:id',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveCategoryController.updateLeaveCategory(req, res)
);

router.get(
  '/get',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveCategoryController.getLeaveCategory(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request, res: Response, next: NextFunction) =>
    LeaveCategoryController.deleteLeaveCategory(req, res)
);

export default router;
