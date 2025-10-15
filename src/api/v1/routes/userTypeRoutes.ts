// routes/userTypeRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as UserTypeController from '../v1/controllers/User_TypeController';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post('/create', (req: Request, res: Response, next: NextFunction) =>
  UserTypeController.createUserType(req, res)
);

router.put('/update', (req: Request, res: Response, next: NextFunction) =>
  UserTypeController.updateUserType(req, res)
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  UserTypeController.getUserTypes(req, res)
);

router.delete('/delete/:id', (req: Request<{ id: string }>, res: Response) =>
  UserTypeController.deleteUserType(req, res)
);

export default router;
