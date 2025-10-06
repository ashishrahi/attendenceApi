// routes/roleWithPermissionRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as RoleWithPermissionController from '../controllers/RoleWithPermissionController';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post('/create', (req: Request, res: Response, next: NextFunction) =>
  RoleWithPermissionController.createRoleWithPermissions(req, res)
);

router.put('/update', (req: Request, res: Response, next: NextFunction) =>
  RoleWithPermissionController.updateRoleWithPermissions(req, res)
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  RoleWithPermissionController.getRoleWithPermissions(req, res)
);

router.get('/get/:id', (req: Request, res: Response, next: NextFunction) =>
  RoleWithPermissionController.getRoleWithPermissions(req, res)
);

router.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) =>
  RoleWithPermissionController.deleteRoleWithPermissions(req, res)
);

export default router;
