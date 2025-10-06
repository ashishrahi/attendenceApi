import { leaveMappingRepository } from "../repository/leaveMappingRepository";
import { handleUnknownError } from "../utilities/helper/handleUnknownError";
import {LeaveMappingEmployeeTypeAttributes} from "../model/leaveMappingEmployeeModel";

// CREATE
export const createLeaveMappingService = async (payload: LeaveMappingEmployeeTypeAttributes) => {
  try {
    const result = await leaveMappingRepository.createLeaveMapping(payload);
    return {
      success: true,
      message: "Leave mapping created successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// GET
export const getLeaveMappingService = async (payload?: Partial<LeaveMappingEmployeeTypeAttributes>) => {
  try {
    const result = await leaveMappingRepository.getLeaveMapping(payload);
    return {
      success: true,
      message: "Leave mapping fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// UPDATE
export const updateLeaveMappingService = async (
  id: number,
  payload: LeaveMappingEmployeeTypeAttributes
) => {
  try {
    const result = await leaveMappingRepository.updateLeaveMapping(id, payload);
    return {
      success: true,
      message: "Leave mapping updated successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// DELETE
export const deleteLeaveMappingService = async (id: number) => {
  try {
    const result = await leaveMappingRepository.deleteLeaveMapping(id);
    return {
      success: true,
      message: "Leave mapping deleted successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
