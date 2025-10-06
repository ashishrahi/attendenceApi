// routes/helpRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as HelpController from '../controllers/HelpCreationController';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post('/create', (req: Request, res: Response, next: NextFunction) =>
  HelpController.createHelpCreation(req, res)
);

router.put('/update', (req: Request, res: Response, next: NextFunction) =>
  HelpController.updateHelpCreation(req, res)
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  HelpController.getHelpCreation(req, res)
);

router.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) =>
  HelpController.deleteHelpCreation(req, res)
);

export default router;
