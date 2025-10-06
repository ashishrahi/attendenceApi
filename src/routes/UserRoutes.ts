// routes/userRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as UserController from '../controllers/UserController';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    UserController.createUser(req, res)
);

router.put(
  '/update/:id',
  (req: Request<{ id: string }>, res: Response) =>
    UserController.updateUser(req, res)
);

router.get(
  '/get/:id',
  (req: Request, res: Response, next: NextFunction) =>
    UserController.getUser(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request<{ id: string }>, res: Response) =>
    UserController.deleteUser(req, res)
);

export default router;
