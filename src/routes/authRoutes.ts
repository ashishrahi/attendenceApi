// routes/authRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/login', (req: Request, res: Response, next: NextFunction) =>
  authController.login(req, res)
);

router.post('/resetpassword', (req: Request, res: Response, next: NextFunction) =>
  authController.resetPassword(req, res)
);

router.post('/changepassword', (req: Request, res: Response, next: NextFunction) =>
  authController.changePassword(req, res)
);

export default router;
