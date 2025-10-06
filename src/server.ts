import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import path from 'path';
// import swaggerUi from 'swagger-ui-express';
import sequelize from './config/dbConfig';
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ All models synchronized');
});

// import initializeSocket from './controllers/socketDashboard';
// import { getConnection } from './config/database';

// Route imports
import authRoutes from './routes/authRoutes';
import DeptRoutes from './routes/DepartmentRoutes';
import DesigRoutes from './routes/DesignationRoutes';
// import ZoneRoutes from './routes/ZoneRoutes';
import WardRoutes from './routes/WardRoutes';
import AreaRoutes from './routes/AreaRoutes';
import BeatRoutes from './routes/BeatRoutes';
import GenderRoutes from './routes/GenderRoutes';
// import DeviceRoutes from './routes/DeviceRoutes';
// import RoleRoutes from './routes/RoleRoutes';
import ShiftRoutes from './routes/ShiftRoutes';
// import ReportRoutes from './routes/ReportRoutes';
// import HoliDayRoutes from './routes/HoliDayRoutes';
import BreakRoutes from './routes/BreakRoutes';
// import User_TypeRoutes from './routes/userTypeRoutes';
// import MenuRoutes from './routes/MenuRoutes';
// import RoleWithPermissionRoutes from './routes/RoleWithPermissionRoutes';
import UserRoutes from './routes/UserRoutes';
// import LoginRoutes from './routes/LoginRoutes';
// import UserPermissionRoutes from './routes/UserPermissionRoutes';
// import LeaveTypeRoutes from './routes/LeaveTypeRoutes';
// import LeaveRequestRoutes from './routes/LeaveRequestRoutes';
// import LeaveBalanceRoutes from './routes/LeaveBalanceRoutes';
// import LeaveCategoryRoutes from './routes/LeaveCategoryRoutes';
// import EmployeeTypeRoutes from './routes/EmployeeTypeRoutes';
// import EmployeeMapLeaveTypeController from './routes/EmployeeMapLeaveTypeRoutes';
// import HelpCreationRoutes from './routes/HelpCreationRoutes';
// import DashboardRoutes from './routes/DashboardRoutes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
// const io = initializeSocket(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
// app.set('io', io);



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shift', ShiftRoutes);
// app.use('/api/holiday', HoliDayRoutes);
app.use('/api/department', DeptRoutes);
app.use('/api/designation', DesigRoutes);
// app.use('/api/zone', ZoneRoutes);
app.use('/api/ward', WardRoutes);
app.use('/api/area', AreaRoutes);
app.use('/api/beat', BeatRoutes);
app.use('/api/gender', GenderRoutes);
// app.use('/api/device', DeviceRoutes);
// app.use('/api/role', RoleRoutes);
app.use('/api/break', BreakRoutes);
// app.use('/api/report', ReportRoutes);
// app.use('/api/usertype', User_TypeRoutes);
// app.use('/api/menu', MenuRoutes);
// app.use('/api/roleuser', RoleWithPermissionRoutes);
app.use('/api/user', UserRoutes);
// app.use('/api/login', LoginRoutes);
// app.use('/api/userpermission', UserPermissionRoutes);
// app.use('/api/leavetype', LeaveTypeRoutes);
// app.use('/api/leaveapp', LeaveRequestRoutes);
// app.use('/api/leavebalance', LeaveBalanceRoutes);
// app.use('/api/leavecategory', LeaveCategoryRoutes);
// app.use('/api/employeetype', EmployeeTypeRoutes);
// app.use('/api/employeemap', EmployeeMapLeaveTypeController);
// app.use('/api/helpcreate', HelpCreationRoutes);
// app.use('/api/dashboard', DashboardRoutes);

// Swagger setup
const swaggerFilePath = path.join(__dirname, './swagger-output.json');
const swaggerFile = require(swaggerFilePath);
// app.use('/app', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server setup
const PORT = Number(process.env.PORT) || 5001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  console.log(`🌐 Access locally: http://localhost:${PORT}`);
});