// routes/shiftRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {ShiftController} from "../controllers/index"
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post('/create', (req: Request, res: Response, next: NextFunction) =>
  ShiftController.createShiftController
);

router.put('/update', (req: Request, res: Response, next: NextFunction) =>
  ShiftController.updateShiftController
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  ShiftController.getShiftController
);

router.delete(
  '/delete/:id',
  (req: Request, res: Response) =>
    ShiftController.deleteShiftController
);

export default router;
