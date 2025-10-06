// routes/beatRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as BeatController from '../controllers/BeatController';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post('/create', (req: Request, res: Response, next: NextFunction) =>
  BeatController.createBeat(req, res)
);



router.get('/', (req: Request, res: Response, next: NextFunction) =>
  BeatController.getBeat(req, res)
);

router.put('/update/:id', (req: Request, res: Response, next: NextFunction) =>
  BeatController.updateBeat(req, res)
);

router.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) =>
  BeatController.deleteBeat(req, res)
);

export default router;
