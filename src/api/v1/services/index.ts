import {
  createBeatService,
  getBeatService,
  updateBeatService,
  deleteBeatService,
} from "./beatService";

import {
  createAreaService,
  updateAreaService,
  getAreaService,
  deleteAreaService,
} from "./areaService";
import {
  createDepartmentService,
  getDepartmentService,
  updateDepartmentService,
  deleteDepartmentService,
} from "./departmentService";

import {
  createDesignationService,
  getDesignationService,
  updateDesignationService,
  deleteDesinationService,
} from "./designationService";
import {
  createEmployeeService,
  getEmployeeService,
  updateEmployeeService,
  deleteEmployeeService,
} from "./employeeService";
import {
  createShiftService,
  getShiftService,
  updateShiftService,
  deleteShiftService,
} from "./shiftService";
import {
  createGenderService,
  updateGenderService,
  getGenderService,
  deleteGenderService,
} from "./genderService";
import {
  createEmployeeTypeService,
  updateEmployeeTypeService,
  getEmployeeTypeService,
  deleteEmployeeTypeService,
} from "./employeTypeService";
import {
  createBreakService,
  getBreakService,
  updateBreakService,
  deleteBreakService,
} from "./breakService";
import {
  createZoneService,
  getZoneService,
  updateZoneService,
  deleteZoneService,
} from "./zoneService";
import {
  createWardService,
  getWardService,
  updateWardService,
  deleteWardService,
} from "./wardService";
import {
  createHolidayService,
  updateHolidayService,
  getHolidayService,
  deleteHolidayService,
} from "./holidayService";
import {
  createLeaveTypeService,
  getLeaveTypeService,
  updateLeaveTypeService,
  deleteLeaveTypeService,
} from "./leaveTypeService";
import {
  createRoleService,
  updateRoleService,
  getRoleService,
  deleteRoleService,
} from "./roleService";
import {
  createLeaveCategoryService,
  updateLeaveCategoryService,
  getLeaveCategoryService,
  deleteLeaveCategoryService,
} from "./leaveCategoryService";

import {
  createLeaveService,
  updateLeaveService,
  getLeaveService,
  getbyIdLeaveService,
  deleteLeaveService
} from "./leaveApplicationService";

// area service
export const areaService = {
  createAreaService: createAreaService,
  updateAreaService: updateAreaService,
  getAreaService: getAreaService,
  deleteAreaService: deleteAreaService,
};
// beat service
export const BeatService = {
  createBeatService: createBeatService,
  getBeatService: getBeatService,
  updateBeatService: updateBeatService,
  deleteBeatService: deleteBeatService,
};
//  department service
export const departmentSerivce = {
  createDepartmentService: createDepartmentService,
  getDepartmentService: getDepartmentService,
  updateDepartmentService: updateDepartmentService,
  deleteDepartmentService: deleteDepartmentService,
};
//  designation service
export const designationService = {
  createDesignationService: createDesignationService,
  getDesignationService: getDesignationService,
  updateDesignationService: updateDesignationService,
  deleteDesinationService: deleteDesinationService,
};
// employee service
export const employeeService = {
  createEmployeeService: createEmployeeService,
  getEmployeeService: getEmployeeService,
  updateEmployeeService: updateEmployeeService,
  deleteEmployeeService: deleteEmployeeService,
};

//  shift service
export const shiftService = {
  createShiftService: createShiftService,
  getShiftService: getShiftService,
  updateShiftService: updateShiftService,
  deleteShiftService: deleteShiftService,
};

// gender service
export const genderService = {
  createGenderService: createGenderService,
  updateGenderService: updateGenderService,
  getGenderService: getGenderService,
  deleteGenderService: deleteGenderService,
};

// gender service
export const employeTypeService = {
  createEmployeeTypeService: createEmployeeTypeService,
  updateEmployeeTypeService: updateEmployeeTypeService,
  getEmployeeTypeService: getEmployeeTypeService,
  deleteEmployeeTypeService: deleteEmployeeTypeService,
};

// gender service
export const breakService = {
  createBreakService: createBreakService,
  getBreakService: getBreakService,
  updateBreakService: updateBreakService,
  deleteBreakService: deleteBreakService,
};
// zoneService
export const zoneService = {
  createZoneService: createZoneService,
  getZoneService: getZoneService,
  updateZoneService: updateZoneService,
  deleteZoneService: deleteZoneService,
};
// wardService
export const wardService = {
  createWardService: createWardService,
  getWardService: getWardService,
  updateWardService: updateWardService,
  deleteWardService: deleteWardService,
};

// holidayService
export const holidayService = {
  createHolidayService: createHolidayService,
  updateHolidayService: updateHolidayService,
  getHolidayService: getHolidayService,
  deleteHolidayService: deleteHolidayService,
};

// leaveTypeService
export const leaveTypeService = {
  createLeaveTypeService: createLeaveTypeService,
  getLeaveTypeService: getLeaveTypeService,
  updateLeaveTypeService: updateLeaveTypeService,
  deleteLeaveTypeService: deleteLeaveTypeService,
};

// leaveCategoryService
export const leaveCategoryService = {
  createLeaveCategoryService: createLeaveCategoryService,
  getLeaveCategoryService: getLeaveCategoryService,
  updateLeaveCategoryService: updateLeaveCategoryService,
  deleteLeaveCategoryService: deleteLeaveCategoryService,
};
// roleService
export const roleService = {
  createRoleService: createRoleService,
  updateRoleService: updateRoleService,
  getRoleService: getRoleService,
  deleteRoleService: deleteRoleService,
};

// leaveApplicationService
export const leaveRequestService = {
  createLeaveService: createLeaveService,
  updateLeaveService: updateLeaveService,
  getLeaveService: getLeaveService,
  getbyIdLeaveService: getbyIdLeaveService,
  deleteLeaveService: deleteLeaveService
};
// leaveBalanceService
export const leaveBalanceService = {
  createLeaveBalanace: createLeaveService,
  updateLeaveService: updateLeaveService,
  getLeaveService: getLeaveService,
  getbyIdLeaveService: getbyIdLeaveService,
  deleteLeaveService: deleteLeaveService
};