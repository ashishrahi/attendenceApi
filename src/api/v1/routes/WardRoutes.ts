// routes/wardRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import  {WardController} from '../controllers/index';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    WardController.createWardController(req, res)
);

router.put(
  '/update',
  (req: Request, res: Response, next: NextFunction) =>
    WardController.updateWardController(req, res)
);

router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) =>
    WardController.getWardController(req, res,)
);

router.delete(
  '/delete/:id',
  (req: Request<{ id: string }>, res: Response) =>
    WardController.deleteWardController(req, res)
);

export default router;
