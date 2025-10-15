// services/roleService.ts
import { roleRepository } from "../repository/index";
import { handleUnknownError } from "../utilities/helper/handleUnknownError";
import { LeaveCategoryCreationAttributes } from "../model/LeaveCategory";
import { leaveCategoryRepository } from "../repository/leaveCategoryRepository";

// CREATE
export const createLeaveCategoryService = async (payload: LeaveCategoryCreationAttributes) => {
  try {
    const result = await leaveCategoryRepository.create(payload);
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
export const getLeaveCategoryService = async () => {
  try {
    const result = await roleRepository.findAll();
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
export const updateLeaveCategoryService = async (id: number, payload: LeaveCategoryCreationAttributes) => {
  try {
    const result = await leaveCategoryRepository.update(id, payload);
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
export const deleteLeaveCategoryService = async (id: number) => {
  try {
    const result = await leaveCategoryRepository.delete(id);
    return {
      success: true,
      message: "leave category deleted successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
