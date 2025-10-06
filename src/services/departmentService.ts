import { departmentRepository } from "../repository/index"
import { handleUnknownError } from "../utilities/helper/handleUnknownError";
import DepartmentCreationAttributes from '../model/departmentModel'

// create
export const createDepartmentService = async(payload:DepartmentCreationAttributes)=>{
    try {
          const result = await departmentRepository.createDepartment(payload)        
    return{
        success: true,
        message: "Department created successfully",
        data: result
    }
        } catch (error) {
        handleUnknownError(error)
    }
}
// get
export const getDepartmentService = async(payload: DepartmentCreationAttributes)=> {
    try {
    const result = await departmentRepository.getDepartment(payload);

        return{
            success: true,
            message: "department fetch successfully",
            data:result
        }
    } catch (error) {
     handleUnknownError(error)
        
    }

}

// update
export const updateDepartmentService = async(id:number, payload: DepartmentCreationAttributes)=>{
    try {
        const result = await departmentRepository.updateDepartment(id, payload);
        return{
            success: true,
            message: "department updated successfully",
            data: result

        }
    } catch (error) {
        handleUnknownError(error)
    }
}


// delete
export const deleteDepartmentService = async(id:number)=>{
    try {
        const result = await departmentRepository.deleteDepartment(id);
        return{
            success: true,
            message: "delete department successfully",
            data: result
        }
    } catch (error) {
        handleUnknownError(error)
    }
}