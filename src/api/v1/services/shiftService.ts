import { shiftRespository } from "../repository/shiftRespository";
import { handleUnknownError } from "../../../utilities/helper/handleUnknownError";
import ShiftCreationAttributes from "../../../model/shiftModel";

// create
export const createShiftService = async (payload: ShiftCreationAttributes) => {
  try {
    const result = await shiftRespository.createShift(payload);
    return {
      success: true,
      message: "shift created successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
// get
export const getShiftService = async (payload: ShiftCreationAttributes) => {
  try {
    const result = await shiftRespository.getShift(payload);
    return {
      success: true,
      message: "shift fetch successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
// update
export const updateShiftService = async (
  id: number,
  payload: ShiftCreationAttributes
) => {
  try {
    const result = await shiftRespository.updateShift(id, payload);
    return {
      success: true,
      message: "shift update successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error)
  }
};
export const deleteShiftService = async(id: number) => {
try {
    const result = await shiftRespository.deleteShift(id);
    return {
      success: true,
      message: "shift update successfully",
      data: result,
    };
    
} catch (error) {
    handleUnknownError(error)
}
};
