
import { leaveRequestRepository, roleRepository } from "../repository/index";
import { handleUnknownError } from "../../../utilities/helper/handleUnknownError";
import { LeaveRequestCreationAttributes } from "../../../model/LeaveRequest";

// CREATE
export const createLeaveService = async (payload: LeaveRequestCreationAttributes) => {
  try {
    const result = await leaveRequestRepository.create(payload);
    return {
      success: true,
      message: "Leave Category created successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// GET ALL
export const getLeaveService = async () => {
  try {
    const result = await leaveRequestRepository.findAll();
    return {
      success: true,
      message: "leave category fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
// getbyIdLeaveService
export const getbyIdLeaveService = async (id:number) => {
  try {
    const result = await leaveRequestRepository.findById(id);
    return {
      success: true,
      message: "leave category fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// UPDATE
export const updateLeaveService = async (id: number, payload: LeaveRequestCreationAttributes) => {
  try {
    const result = await leaveRequestRepository.update(id, payload);
    return {
      success: true,
      message: "Role updated successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// DELETE
export const deleteLeaveService = async (id: number) => {
  try {
    const result = await leaveRequestRepository.delete(id);
    return {
      success: true,
      message: "leave category deleted successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
