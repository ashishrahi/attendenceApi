import { genderRepository } from "../repository"
import { handleUnknownError } from "../../../utilities/helper/handleUnknownError"
import genderAttributes from '../../../model/genderModel'

// create gender service
export const createGenderService = async(payload: genderAttributes)=>{
    try {
        const result = await genderRepository.createGender(payload)
        return {
            success: true,
            message: "gender create successfully",
            data: result
        }
    } catch (error) {
        handleUnknownError(error)
    }
}
//  gender update
export const updateGenderService = async(id:number, payload: genderAttributes) =>{
    try {
        const result = await genderRepository.updateGender(id, payload)
        return{
            success: true,
            message: "gender update successfully",
            data: result
        }
    } catch (error) {
        handleUnknownError(error)
    }
}
// get gender service
export const getGenderService = async(payload: genderAttributes)=>{
    try {
        const result = await genderRepository.getGender(payload)
        return{
              success: true,
              message: "gender fetch successfully",
              data: result
        }
    } catch (error) {
        handleUnknownError(error)
    }
}
// delete gender service

export const deleteGenderService = async(id: number)=>{
    try {
        const result = await genderRepository.deleteGender(id)
        return{
            success: true,
            message: "Gender deleted successfully",
            data: result
        }
    } catch (error) {
        handleUnknownError(error)
    }
}