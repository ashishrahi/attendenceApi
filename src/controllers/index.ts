import {login, resetPassword, changePassword}  from '../controllers/authController'
import { createDepartment, getDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController'
import { createBreakController, getBreaksController, updateBreakController, deleteBreakController } from "./BreakController"
import { createShiftController, updateShiftController, getShiftController, deleteShiftController } from "./shiftController"
import { createGenderController, updateGenderController, getGenderController, deleteGenderController } from "./genderController"
import { createZoneController, updateZoneController, getZoneController, deleteZoneController } from "./zoneController"
import { createWardController, updateWardController, getWardController, deleteWardController } from "./wardController"

// auth
export const authController = {
    login : login,
    resetPassword : resetPassword,
    changePassword : changePassword
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