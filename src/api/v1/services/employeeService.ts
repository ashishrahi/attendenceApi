import { handleUnknownError } from "../../../utilities/helper/handleUnknownError"
import { employeeRepository } from "../repository/empolyeeRepository"
import employeeAttributes from "../../../model/employeeModel";


// create employee 

export const createEmployeeService = async(payload: employeeAttributes)=>{
    try {
        const result = await employeeRepository.createEmployee(payload)
        return{
            succuss: true,
            message: "employee created successfully",
            data: result
        }
        
    } catch (error) {
      handleUnknownError(error)
    }
}

export const getEmployeeService = async(payload: employeeAttributes)=>{
    try {
        
      const result = await employeeRepository.getEmployee(payload)
        return{
            succuss: true,
            message: "employee list  successfully",
            data: result
        }
        

    } catch (error) {
      handleUnknownError(error)
        
    }
}

export const updateEmployeeService = async(id:number, payload:employeeAttributes)=>{
    try {
          const result = await employeeRepository.updateEmployee(id,payload)
        return{
            succuss: true,
            message: "employee updated successfully",
            data: result
        }
    } catch (error) {
      handleUnknownError(error)
        
    }
}

export const deleteEmployeeService =async(id:number)=>{
    try {
         const result = await employeeRepository.deleteEmployee(id)
        return{
            succuss: true,
            message: "employee deleted successfully",
        }
    } catch (error) {
      handleUnknownError(error)
        
    }
}