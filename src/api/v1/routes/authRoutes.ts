// routes/authRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {authController} from '../controllers/index';

const router = Router();

router.post('/login', (req: Request, res: Response, next: NextFunction) =>
  authController.loginController(req, res)
);

router.post('/resetpassword', (req: Request, res: Response, next: NextFunction) =>
  authController.resetPasswordController(req, res)
);

router.post('/changepassword', (req: Request, res: Response, next: NextFunction) =>
  authController.changePasswordController(req, res)
);

export default router;
