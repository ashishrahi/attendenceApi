import { breakRepository } from "../repository";
import { handleUnknownError } from "../../../utilities/helper/handleUnknownError";
import Break, { BreakCreationAttributes } from "../../../model/breakModel";

// CREATE
export const createBreakService = async (payload: BreakCreationAttributes) => {
  try {
    const result = await breakRepository.createBreak(payload);
    return {
      success: true,
      message: "Break created successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// READ (GET ALL)
export const getBreakService = async (payload: BreakCreationAttributes) => {
  try {
    const result = await breakRepository.getBreaks(payload);
    return {
      success: true,
      message: "Break list fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// UPDATE
export const updateBreakService = async (
  id: number,
  payload: BreakCreationAttributes
) => {
  try {
    const result = await breakRepository.updateBreak(id, payload);
    return {
      success: true,
      message: "Break updated successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// DELETE
export const deleteBreakService = async (id: number) => {
  try {
    await breakRepository.deleteBreak(id);
    return {
      success: true,
      message: "Break deleted successfully",
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
