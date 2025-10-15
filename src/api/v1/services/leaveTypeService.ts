import { leaveTypeRepository } from "../repository/leaveTypeRepository";
import { handleUnknownError } from "../../../utilities/helper/handleUnknownError";
import LeaveType, { LeaveTypeAttributes, LeaveTypeCreationAttributes } from "../../../model/leaveTypeModel";

// CREATE
export const createLeaveTypeService = async (payload: LeaveTypeCreationAttributes) => {
  try {
    const result = await leaveTypeRepository.create(payload);
    return {
      success: true,
      message: "Leave type created successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// GET ALL
export const getLeaveTypeService = async (payload:LeaveTypeAttributes) => {
  try {
    const result = await leaveTypeRepository.findAll();
    return {
      success: true,
      message: "Leave types fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// UPDATE
export const updateLeaveTypeService = async (
  id: number,
  payload: LeaveTypeCreationAttributes
) => {
  try {
    const result = await leaveTypeRepository.update(id, payload);
    return {
      success: true,
      message: "Leave type updated successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// DELETE
export const deleteLeaveTypeService = async (id: number) => {
  try {
    const result = await leaveTypeRepository.delete(id);
    return {
      success: true,
      message: "Leave type deleted successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
