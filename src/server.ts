import 'dotenv/config';
import express, { Request, Response} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import path from 'path';
// import swaggerUi from 'swagger-ui-express';
import sequelize from './config/dbConfig';
sequelize.sync({ alter: true }).then(() => {
  console.log('All models synchronized');
});

// import initializeSocket from './controllers/socketDashboard';
// import { getConnection } from './config/database';

// Route imports
import authRoutes from './api/v1/routes/authRoutes';
import DeptRoutes from './api/v1/routes/DepartmentRoutes';
import DesigRoutes from './api/v1/routes/DesignationRoutes';
import ZoneRoutes from './api/v1/routes/ZoneRoutes';
import WardRoutes from './api/v1/routes/WardRoutes';
import AreaRoutes from './api/v1/routes/AreaRoutes';
import BeatRoutes from './api/v1/routes/BeatRoutes';
import GenderRoutes from './api/v1/routes/GenderRoutes';
// import DeviceRoutes from './routes/DeviceRoutes';
import RoleRoutes from './api/v1/routes/RoleRoutes';
import ShiftRoutes from './api/v1/routes/ShiftRoutes';
// import ReportRoutes from './routes/ReportRoutes';
import HoliDayRoutes from './api/v1/routes/HoliDayRoutes';
import BreakRoutes from './api/v1/routes/BreakRoutes';
// import User_TypeRoutes from './v1/routes/userTypeRoutes';
// import MenuRoutes from './routes/MenuRoutes';
// import RoleWithPermissionRoutes from './routes/RoleWithPermissionRoutes';
import EmployeeRoutes from './api/v1/routes/EmployeeRoutes';
// import LoginRoutes from './routes/LoginRoutes';
// import UserPermissionRoutes from './routes/UserPermissionRoutes';
import LeaveTypeRoutes from './api/v1/routes/LeaveTypeRoutes';
import LeaveRequestRoutes from './api/v1/routes/LeaveRequestRoutes';
import LeaveBalanceRoutes from './api/v1/routes/LeaveBalanceRoutes';
import LeaveCategoryRoutes from './api/v1/routes/LeaveCategoryRoutes';
import EmployeeTypeRoutes from './api/v1/routes/EmployeeTypeRoutes';
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
// app.use('/api/v1/device', DeviceRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/shift', ShiftRoutes);
app.use('/api/v1/holiday', HoliDayRoutes);
app.use('/api/v1/department', DeptRoutes);
app.use('/api/v1/designation', DesigRoutes);
app.use('/api/v1/zone', ZoneRoutes);
app.use('/api/v1/ward', WardRoutes);
app.use('/api/v1/area', AreaRoutes);
app.use('/api/v1/beat', BeatRoutes);
app.use('/api/v1/gender', GenderRoutes);
app.use('/api/v1/role', RoleRoutes);
app.use('/api/v1/break', BreakRoutes);
// app.use('/api/v1/report', ReportRoutes);
// app.use('/api/v1/usertype', User_TypeRoutes);
// app.use('/api/v1/menu', MenuRoutes);
// app.use('/api/v1/roleuser', RoleWithPermissionRoutes);
app.use('/api/v1/employee', EmployeeRoutes);
// app.use('/api/v1/login', LoginRoutes);
// app.use('/api/userpermission', UserPermissionRoutes);
app.use('/api/v1/leavetype', LeaveTypeRoutes);
app.use('/api/v1/leaveapp', LeaveRequestRoutes);
app.use('/api/v1/leavebalance', LeaveBalanceRoutes);
app.use('/api/v1/leavecategory', LeaveCategoryRoutes);
app.use('/api/v1/employeetype', EmployeeTypeRoutes);
// app.use('/api/v1/employeemap', EmployeeMapLeaveTypeController);
// app.use('/api/v1/helpcreate', HelpCreationRoutes);
// app.use('/api/v1/dashboard', DashboardRoutes);

// Swagger setup


// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
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
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Access locally: http://localhost:${PORT}`);
});