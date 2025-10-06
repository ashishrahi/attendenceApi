// routes/shiftRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as ShiftController from '../controllers/ShiftController';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post('/create', (req: Request, res: Response, next: NextFunction) =>
  ShiftController.createShift(req, res)
);

router.put('/update', (req: Request, res: Response, next: NextFunction) =>
  ShiftController.updateShift(req, res)
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  ShiftController.getShift(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request<{ id: string }>, res: Response) =>
    ShiftController.deleteShift(req, res)
);

export default router;
