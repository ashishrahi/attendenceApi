import { designationRepository } from "../repository/index";
import { handleUnknownError } from "../utilities/helper/handleUnknownError";
import DesignationAttributes from '../model/designationModel'

// create
export const createDesignationService = async (payload:DesignationAttributes) => {
  try {
    const result = await designationRepository.createDesignation(payload);
    return {
      success: true,
      message: "designation created successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
// get
export const getDesignationService = async (payload: DesignationAttributes) => {
  try {
    const result = await designationRepository.getDesignation(payload);
    return {
      success: true,
      message: "list of designations",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
// update
export const updateDesignationService = async (id:number, payload: DesignationAttributes) => {
  try {
    const result = await designationRepository.updateDesignation(id, payload);
    return {
      success: true,
      message: "list of designations",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
// delete

export const deleteDesinationService = async (id:number) => {
  try {
    const result = await designationRepository.deleteDesignation(id);

    return {
      success: true,
      message: "list of designations",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
