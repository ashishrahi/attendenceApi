// routes/reportRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as ReportController from '../controllers/ReportController';
// import auth from '../middleware/auth'; // Uncomment if authentication is needed

const router = Router();

router.post('/daily', (req: Request, res: Response, next: NextFunction) =>
  ReportController.handleDailyReport(req, res, next)
);

router.post('/monthly', (req: Request, res: Response, next: NextFunction) =>
  ReportController.handleMonthlyReport(req, res, next)
);

router.post('/punch', (req: Request, res: Response, next: NextFunction) =>
  ReportController.handlePunchReport(req, res, next)
);

router.post('/out', (req: Request, res: Response, next: NextFunction) =>
  ReportController.OutReports(req, res, next)
);

router.post('/breakattendance', (req: Request, res: Response, next: NextFunction) =>
  ReportController.BreakAttendance(req, res, next)
);

router.post('/punch-correction', (req: Request, res: Response, next: NextFunction) =>
  ReportController.PunchCorrection(req, res, next)
);

export default router;
