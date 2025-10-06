// routes/breakRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {BreakController} from '../controllers/index';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post('/create', (req: Request, res: Response, next: NextFunction) =>
  BreakController.createBreakController(req, res)
);



router.get('/', (req: Request, res: Response, next: NextFunction) =>
  BreakController.getBreaksController(req, res,)
);

router.put('/update/:id', (req: Request, res: Response, next: NextFunction) =>
  BreakController.updateBreakController(req, res)
);

router.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) =>
  BreakController.deleteBreakController(req, res)
);

export default router;
