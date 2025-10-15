import {loginController, resetPasswordController, changePasswordController}  from './authController'
import { createDepartment, getDepartment, updateDepartment, deleteDepartment } from './departmentController'
import { createBreakController, getBreaksController, updateBreakController, deleteBreakController } from "./BreakController"
import { createShiftController, updateShiftController, getShiftController, deleteShiftController } from "./shiftController"
import { createGenderController, updateGenderController, getGenderController, deleteGenderController } from "./genderController"
import { createZoneController, updateZoneController, getZoneController, deleteZoneController } from "./zoneController"
import { createWardController, updateWardController, getWardController, deleteWardController } from "./wardController"
import { createBeatController, getBeatController, updateBeatController, deleteBeatController } from "./beatController"
import { createHolidayController, updateHolidayController, getHolidaysController, deleteHolidayController } from "./holidayController"
import { createLeaveTypeController, updateLeaveTypeController, getLeaveTypesController, deleteLeaveTypeController } from "./leaveTypeController"
import { createEmployeeTypeController, updateEmployeeTypeController, getEmployeeTypesController, deleteEmployeeTypeController } from "./employeeTypeController"
import { createEmployeeController, updateEmployeeController, getEmployeeController, deleteEmployeeController } from "./employeeController"
import { createRoleController, updateRoleController, getRoleController, deleteRoleController } from "./roleController"
import { createLeaveCategoryController, updateLeaveCategoryController, getLeaveCategoryController, deleteLeaveCategoryController } from "./leaveCategoryController"
import { createLeaveController, updateLeaveStatusController, getAllLeaveApplicationsController, getLeaveApplicationByIdController, deleteLeaveApplicationController } from "./leaveRequestController"
import { createLeaveBalanceController, updateLeaveBalanceController, getLeaveBalanceController, deleteLeaveBalanceController } from "./leaveBalanceController"
import { createHelpCreationController, updateHelpCreationController, getHelpCreationController, deleteHelpCreationController } from "./helpCreationController"


// auth
export const authController = {
    loginController : loginController,
    resetPasswordController : resetPasswordController,
    changePasswordController : changePasswordController
}
// department
export const departmentController ={
    createDepartment : createDepartment ,
    getDepartment : getDepartment,
    updateDepartment : updateDepartment,
    deleteDepartment : deleteDepartment
}
// Break
export const BreakController = {
createBreakController: createBreakController,
getBreaksController: getBreaksController,
updateBreakController: updateBreakController,
deleteBreakController: deleteBreakController
}
//  ShiftController
export const ShiftController = {
createShiftController: createShiftController,
updateShiftController: updateShiftController,
getShiftController: getShiftController,
deleteShiftController: deleteShiftController
}
// GenderController
export const GenderController = {
createGenderController: createGenderController,
updateGenderController: updateGenderController,
getGenderController: getGenderController,
deleteGenderController: deleteGenderController
}

// ZoneController
export const ZoneController = {
createZoneController: createZoneController,
updateZoneController: updateZoneController,
getZoneController: getZoneController,
deleteZoneController: deleteZoneController
}
// WardController
export const WardController = {
createWardController: createWardController,
updateWardController: updateWardController,
getWardController: getWardController,
deleteWardController: deleteWardController
}
// BeatController
export const BeatController = {
createBeatController: createBeatController,
getBeatController: getBeatController,
updateBeatController: updateBeatController,
deleteBeatController: deleteBeatController
}
// HoliDayController
export const HoliDayController = {
createHolidayController: createHolidayController,
updateHolidayController: updateHolidayController,
getHolidaysController: getHolidaysController,
deleteHolidayController: deleteHolidayController
}

// LeaveTypeController
export const LeaveTypeController = {
createLeaveTypeController: createLeaveTypeController,
updateLeaveTypeController: updateLeaveTypeController,
getLeaveTypesController: getLeaveTypesController,
deleteLeaveTypeController: deleteLeaveTypeController
}
// EmployeeTypeController
export const EmployeeTypeController = {
createEmployeeTypeController: createEmployeeTypeController,
updateEmployeeTypeController: updateEmployeeTypeController,
getEmployeeTypesController: getEmployeeTypesController,
deleteEmployeeTypeController: deleteEmployeeTypeController
}
// EmployeeController
export const EmployeeController = {
createEmployeeController: createEmployeeController,
updateEmployeeController: updateEmployeeController,
getEmployeeController: getEmployeeController,
deleteEmployeeController: deleteEmployeeController
}
// RoleController
export const RoleController = {
createRoleController: createRoleController,
updateRoleController: updateRoleController,
getRoleController: getRoleController,
deleteRoleController: deleteRoleController
}

// LeaveCategoryController
export const LeaveCategoryController = {
createLeaveCategoryController: createLeaveCategoryController,
updateLeaveCategoryController: updateLeaveCategoryController,
getLeaveCategoryController: getLeaveCategoryController,
deleteLeaveCategoryController: deleteLeaveCategoryController
}

// LeaveRequestController
export const LeaveRequestController = {
createLeaveController: createLeaveController,
updateLeaveStatusController: updateLeaveStatusController,
getAllLeaveApplicationsController: getAllLeaveApplicationsController,
getLeaveApplicationByIdController: getLeaveApplicationByIdController,
deleteLeaveApplicationController: deleteLeaveApplicationController
}

// LeaveBalanceController
export const LeaveBalanceController = {
createLeaveBalanceController: createLeaveBalanceController,
updateLeaveBalanceController: updateLeaveBalanceController,
getLeaveBalanceController: getLeaveBalanceController,
deleteLeaveBalanceController: deleteLeaveBalanceController,
}

// HelpController
export const HelpController = {
createHelpCreationController: createHelpCreationController,
updateHelpCreationController: updateHelpCreationController,
getHelpCreationController: getHelpCreationController,
deleteHelpCreationController: deleteHelpCreationController,
}