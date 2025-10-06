// routes/areaRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as AreaController from '../controllers/AreaController';

const router = Router();

router.post('/create', (req: Request, res: Response, next?: NextFunction) =>
  AreaController.createArea(req, res)
);



router.get('/', (req: Request, res: Response, next?: NextFunction) =>
  AreaController.getArea(req, res,)
);

router.put('/update/:id', (req: Request, res: Response, next: NextFunction) =>
  AreaController.updateArea(req, res, )
);

router.delete('/delete/:id', (req: Request, res: Response, next?: NextFunction) =>
  AreaController.deleteArea(req, res, )
);

export default router;
