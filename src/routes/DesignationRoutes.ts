// routes/desigRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as DesigController from '../controllers/designationController';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post('/create', (req: Request, res: Response, next: NextFunction) =>
  DesigController.createDesignation(req, res)
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  DesigController.getDesignation(req, res)
);

router.put('/update/:id', (req: Request<{ id: string }>, res: Response, next: NextFunction) =>
  DesigController.updateDesignation(req, res)
);



router.delete('/delete/:id', (req: Request<{ id: string }>, res: Response) =>
  DesigController.deleteDesignation(req, res)
);

export default router;
