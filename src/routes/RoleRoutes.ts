// routes/roleRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as RoleController from '../controllers/RoleController';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post('/create', (req: Request, res: Response, next: NextFunction) =>
  RoleController.createRole(req, res)
);

router.put('/update', (req: Request, res: Response, next: NextFunction) =>
  RoleController.updateRole(req, res)
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  RoleController.getRole(req, res)
);

router.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) =>
  RoleController.deleteRole(req, res)
);

export default router;
