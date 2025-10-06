// routes/beatRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {BeatController} from '../controllers/index';

const router = Router();

router.post('/', (req: Request, res: Response, next: NextFunction) =>
  BeatController.createBeatController(req, res)
);



router.get('/', (req: Request, res: Response, next: NextFunction) =>
  BeatController.getBeatController(req, res)
);

router.put('/:id', (req: Request, res: Response, next: NextFunction) =>
  BeatController.updateBeatController(req, res)
);

router.delete('/:id', (req: Request, res: Response, next: NextFunction) =>
  BeatController.deleteBeatController(req, res)
);

export default router;
