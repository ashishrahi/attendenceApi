import { wardRepository } from "../repository/index";

import { handleUnknownError } from "../utilities/helper/handleUnknownError";
import { WardAttributes } from "../types/wardTypes";

// CREATE
export const createWardService = async (payload: WardAttributes) => {
  try {
    const result = await wardRepository.createWard(payload);
    return {
      success: true,
      message: "Ward created successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// READ (GET ALL)
export const getWardService = async (payload?: WardAttributes) => {
  try {
    const result = await wardRepository.getWards(payload);
    return {
      success: true,
      message: "Ward list fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// UPDATE
export const updateWardService = async (id: number, payload: WardAttributes) => {
  try {
    const result = await wardRepository.updateWard(id, payload);
    return {
      success: true,
      message: "Ward updated successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// DELETE
export const deleteWardService = async (id: number) => {
  try {
    await wardRepository.deleteWard(id);
    return {
      success: true,
      message: "Ward deleted successfully",
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
