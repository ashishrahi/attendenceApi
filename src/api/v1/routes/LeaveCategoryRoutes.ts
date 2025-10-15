// routes/leaveCategoryRoutes.ts
import { Router, Request, Response } from 'express';
import {LeaveCategoryController} from '../controllers/index';

const router = Router();


router.post(
  '/create',
  (req: Request, res: Response) =>
    LeaveCategoryController.createLeaveCategoryController(req, res)
);

router.put(
  '/update/:id',
  (req: Request, res: Response) =>
    LeaveCategoryController.updateLeaveCategoryController(req, res)
);

router.get(
  '/get',
  (req: Request, res: Response) =>
    LeaveCategoryController.getLeaveCategoryController(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request, res: Response) =>
    LeaveCategoryController.deleteLeaveCategoryController(req, res)
);

export default router;
