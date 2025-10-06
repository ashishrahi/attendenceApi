import { employeeTypeRepository, genderRepository } from "../repository"
import { handleUnknownError } from "../utilities/helper/handleUnknownError"
import employeeTypeAttributes from '../model/employeeTypeModel'

// create employeetype service
export const createEmployeeTypeService = async(payload: employeeTypeAttributes)=>{
    try {
        const result = await employeeTypeRepository.createEmployeeType(payload)
        return {
            success: true,
            message: "employeeType create successfully",
            data: result
        }
    } catch (error) {
        handleUnknownError(error)
    }
}
//  employeetype service update
export const updateEmployeeTypeService = async(id:number, payload: employeeTypeAttributes) =>{
    try {
        const result = await employeeTypeRepository.updateEmployeeType(id, payload)
        return{
            success: true,
            message: "employeeType update successfully",
            data: result
        }
    } catch (error) {
        handleUnknownError(error)
    }
}
// get employeetype service
export const getEmployeeTypeService = async(payload: employeeTypeAttributes)=>{
    try {
        const result = await employeeTypeRepository.getEmployeeTypes(payload)
        return{
              success: true,
              message: "employeeType fetch successfully",
              data: result
        }
    } catch (error) {
        handleUnknownError(error)
    }
}
// delete employeetype service

export const deleteEmployeeTypeService = async(id: number)=>{
    try {
        const result = await employeeTypeRepository.deleteEmployeeType(id)
        return{
            success: true,
            message: "employeeType deleted successfully",
            data: result
        }
    } catch (error) {
        handleUnknownError(error)
    }
}