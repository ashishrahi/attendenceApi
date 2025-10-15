// routes/genderRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {GenderController} from '../controllers/index';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response) =>
    GenderController.createGenderController
);

router.put(
  '/update/:id',
  (req: Request, res: Response) =>
    GenderController.updateGenderController
);

router.get(
  '/',
  (req: Request, res: Response) =>
    GenderController.getGenderController
);

router.delete(
  '/delete/:id',
  (req: Request, res: Response) =>
    GenderController.deleteGenderController
);

export default router;
