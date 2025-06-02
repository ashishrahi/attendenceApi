require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const initializeSocket = require('./controllers/socketDashboard');
const { getConnection } = require('./config/database');
const swaggerUi = require("swagger-ui-express");
const path = require("path");

// Route imports
const authRoutes = require('./routes/authRoutes');
const personaRoutes = require('./routes/personaRoutes');
const DeptRoutes = require('./routes/DeptRoutes');
const DesigRoutes = require('./routes/DesigRoutes');
const ZoneRoutes = require('./routes/ZoneRoutes');
const WardRoutes = require('./routes/WardRoutes');
const AreaRoutes = require('./routes/AreaRoutes');
const BeatRoutes = require('./routes/BeatRoutes');
const GenderRoutes = require('./routes/GenderRoutes');
const DeviceRoutes = require('./routes/DeviceRoutes');
const RoleRoutes = require('./routes/RoleRoutes');
const ShiftRoutes = require('./routes/ShiftRoutes');
const ReportRoutes = require('./routes/ReportRoutes');
const HoliDayRoutes = require('./routes/HoliDayRoutes');
const BreakRoutes = require('./routes/BreakRoutes');
const User_TypeRoutes = require('./routes/User_TypeRoutes');
const MenuRoutes = require('./routes/MenuRoutes');
const RoleWithPermissionRoutes = require('./routes/RoleWithPermissionRoutes');
const UserRoutes = require('./routes/UserRoutes');
const LoginRoutes = require('./routes/LoginRoutes');
const UserPermissionRoutes = require('./routes/UserPermissionRoutes');
const LeaveTypeRoutes = require('./routes/LeaveTypeRoutes');
const LeaveRequestRoutes = require('./routes/LeaveRequestRoutes');
const LeaveBalanceRoutes = require('./routes/LeaveBalanceRoutes');
const LeaveCategoryRoutes = require('./routes/LeaveCategoryRoutes');
const EmployeeTypeRoutes = require('./routes/EmployeeTypeRoutes');
const EmployeeMapLeaveTypeController = require('./routes/EmployeeMapLeaveTypeRoutes');
const jwt = require('jsonwebtoken');
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.get('/hello', (req, res) => {
  res.send("hello");
});

app.use('/api/auth', authRoutes);
app.use('/api/shift', ShiftRoutes);
app.use('/api/holiday', HoliDayRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/department', DeptRoutes);
app.use('/api/designation', DesigRoutes);
app.use('/api/zone', ZoneRoutes);
app.use('/api/ward', WardRoutes);
app.use('/api/area', AreaRoutes);
app.use('/api/beat', BeatRoutes);
app.use('/api/gender', GenderRoutes);
app.use('/api/device', DeviceRoutes);
app.use('/api/role', RoleRoutes);
app.use('/api/break', BreakRoutes);
app.use('/api/report', ReportRoutes);
app.use('/api/usertype', User_TypeRoutes);
app.use('/api/menu', MenuRoutes);
app.use('/api/roleuser', RoleWithPermissionRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/login', LoginRoutes);
app.use('/api/userpermission', UserPermissionRoutes);
app.use('/api/leavetype', LeaveTypeRoutes);
app.use('/api/leaveapp', LeaveRequestRoutes);
app.use('/api/leavebalance', LeaveBalanceRoutes);
app.use('/api/leavecategory', LeaveCategoryRoutes);
app.use('/api/employeetype', EmployeeTypeRoutes);
app.use('/api/employeemap', EmployeeMapLeaveTypeController);


// Swagger setup
const swaggerFilePath = path.join(__dirname, "./swagger-output.json");
const swaggerFile = require(swaggerFilePath);
app.use("/app", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server setup
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '192.168.1.34';

server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
