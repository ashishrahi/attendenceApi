// routes/roleRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {RoleController} from '../controllers/index';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post('/create', (req: Request, res: Response) =>
  RoleController.createRoleController(req, res)
);

router.put('/update', (req: Request, res: Response) =>
  RoleController.updateRoleController(req, res)
);

router.get('/', (req: Request, res: Response) =>
  RoleController.getRoleController(req, res)
);

router.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) =>
  RoleController.deleteRoleController(req, res)
);

export default router;
