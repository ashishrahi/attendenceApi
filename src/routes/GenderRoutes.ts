// routes/genderRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as GenderController from '../controllers/GenderController';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    GenderController.createGender(req, res)
);

router.put(
  '/update/:id',
  (req: Request, res: Response, next: NextFunction) =>
    GenderController.updateGender(req, res)
);

router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) =>
    GenderController.getGender(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request, res: Response, next: NextFunction) =>
    GenderController.deleteGender(req, res)
);

export default router;
