import { beatRepository } from "../repository";
import { handleUnknownError } from "../utilities/helper/handleUnknownError";
import BeatCreationAttributes from '../model/beatModel'
// create
export const createBeatService = async(payload:BeatCreationAttributes)=>{
    
try {
    const result = await beatRepository.createBeat(payload)
    return{
        success: true,
        message: "Beat created successfully",
        data: result
    }
} catch (error) {
       handleUnknownError(error);
   
}
}
// get
export const getBeatService = async( )=> {
    try {
        const result = await beatRepository.getBeat()
        return{
            success: true,
            message: "beat list get successfully",
            data: result
        }
    } catch (error) {
             handleUnknownError(error);

    }
}
// update
export const updateBeatService = async(id:number, payload:BeatCreationAttributes)=>{
try {
    const result = await beatRepository.updateBeat(id, payload);
     return{
        success:"true",
        message: "beat update successfully",
        data: result
     }
} catch (error) {
     handleUnknownError(error);
}
}
// delete
export const deleteBeatService = async(id:number) =>{
    try {
    const result = await beatRepository.deleteBeat(id);
      return{
        success: true,
        message: "beat deleted successfully",

      }  
    } catch (error) {
   handleUnknownError(error);      
    }
}
