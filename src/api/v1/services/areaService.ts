import {areaRepository}  from "../repository/areaRepository";
import { handleUnknownError } from "../../../utilities/helper/handleUnknownError";
import {AreaCreationAttributes} from "../../../model/areaModel";

// create
export const createAreaService =(payload:AreaCreationAttributes)=>{
    try {
        const result = areaRepository.createArea(payload);
        return{
            success: true,
            message: "area created successfully",
            data: result
        }
    } 
    catch (error:any) {
        return{
            success: false,
            message: error.message
        }
    }

}
//  get
export const getAreaService =(payload : AreaCreationAttributes)=>{
    try {
         const result = areaRepository.getAreas(payload);
        return{
            success: true,
            message: "area created successfully",
            data: result
        }
    } catch (error) {
       handleUnknownError(error)
    }
    
}
//  update
export const updateAreaService =(id:number , payload:AreaCreationAttributes)=>{
     try {
         const result = areaRepository.updateArea(id, payload);
        return{
            success: true,
            message: "area created successfully",
            data: result
        }
    } catch (error) {
         handleUnknownError(error)
    }
}
//  delete
export const deleteAreaService =(id:number)=>{
     try {
         const result = areaRepository.deleteArea(id);
         
        return{
            success: true,
            message: "area created successfully",
            data: result
        }
    } catch (error) {
         handleUnknownError(error)
    }
}
