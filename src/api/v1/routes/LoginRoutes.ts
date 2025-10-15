// routes/loginRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as LoginController from '../controllers/LoginController';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post(
  '/login',
  (req: Request, res: Response, next: NextFunction) =>
    LoginController.login(req, res)
);

// Uncomment and add routes as needed
// router.put('/update', (req: Request, res: Response, next: NextFunction) => AreaController.updateArea(req, res, next));
// router.get('/get', (req: Request, res: Response, next: NextFunction) => AreaController.getArea(req, res, next));
// router.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) => AreaController.deleteArea(req, res, next));

export default router;
