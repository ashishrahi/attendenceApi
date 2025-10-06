// routes/userPermissionRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as UserPermissionController from '../controllers/UserPermissionController';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) =>
    UserPermissionController.createUserPermission(req, res)
);

router.put(
  '/update/:id',
  (req: Request<{ id: string }>, res: Response) =>
    UserPermissionController.updateUserPermission(req, res)
);

router.get(
  '/get/:id',
 (req: Request<{ id: string }>, res: Response) =>
    UserPermissionController.getUserPermissions(req, res)
);

router.delete(
  '/delete/:id',
  (req: Request<{ id: string }>, res: Response) =>
    UserPermissionController.deleteUserPermission(req, res)
);

export default router;
