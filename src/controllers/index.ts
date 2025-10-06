import {login, resetPassword, changePassword}  from '../controllers/authController'
import { createDepartment, getDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController'
import { createBreakController, getBreaksController, updateBreakController, deleteBreakController } from "./BreakController"

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