import { leaveBalanceRepository } from "../repository/leaveBalanceRepository";
import { handleUnknownError } from "../../../utilities/helper/handleUnknownError";
import { LeaveBalanceCreationAttributes } from "../../../model/LeaveBalance";

// CREATE
export const createLeaveBalanceService = async (payload: LeaveBalanceCreationAttributes) => {
  try {
    const result = await leaveBalanceRepository.create(payload);
    return {
      success: true,
      message: "Leave balance created successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// GET ALL
export const getLeaveBalanceService = async () => {
  try {
    const result = await leaveBalanceRepository.findAll();
    return {
      success: true,
      message: "Leave balances fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// GET BY ID
export const getLeaveBalanceByIdService = async (id: number) => {
  try {
    const result = await leaveBalanceRepository.findById(id);
    if (!result) throw new Error("Leave balance not found");
    return {
      success: true,
      message: "Leave balance fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// UPDATE
export const updateLeaveBalanceService = async (
  id: number,
  payload: Partial<LeaveBalanceCreationAttributes>
) => {
  try {
    const result = await leaveBalanceRepository.update(id, payload);
    return {
      success: true,
      message: "Leave balance updated successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// DELETE
export const deleteLeaveBalanceService = async (id: number) => {
  try {
    const result = await leaveBalanceRepository.delete(id);
    return {
      success: true,
      message: "Leave balance deleted successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
