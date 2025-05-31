require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const swaggerUi = require("swagger-ui-express");   
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
const DashboardRoutes = require('./routes/DashboardRoutes');
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




app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 100
// });
// app.use(limiter);

app.get('/hello',(req,res)=>{
  res.send("hello")
}
)

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
app.use('/api/dashboard', DashboardRoutes);
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

const path = require("path");

const swaggerFilePath = process.env.NODE_ENV === "production"
  ? path.join(__dirname, "./swagger-output.json")
  : path.join(__dirname, "./swagger-output.json"); 

const swaggerFile = require(swaggerFilePath);

app.use("/app", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});



const PORT = process.env.PORT || 5000;
const HOST = '192.168.1.35';  

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://localhost:${PORT} or http://${HOST}:${PORT}`);
});


app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});



