// routes/menuRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as MenuController from '../controllers/MenuController';
// import auth from '../middleware/auth'; // Uncomment if authentication middleware is needed

const router = Router();

router.post('/create', (req: Request, res: Response, next: NextFunction) =>
  MenuController.createMenu(req, res)
);

router.put('/update', (req: Request, res: Response, next: NextFunction) =>
  MenuController.updateMenu(req, res)
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  MenuController.getMenus(req, res)
);

router.get('/getchild', (req: Request, res: Response, next: NextFunction) =>
  MenuController.getChildMenuMaster(req, res)
);

router.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) =>
  MenuController.deleteMenu(req, res)
);

export default router;
