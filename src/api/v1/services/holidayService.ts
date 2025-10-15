import { holidayRepository } from "../repository/holidayRepository";
import { handleUnknownError } from "../../../utilities/helper/handleUnknownError";
import Holiday, { HolidayCreationAttributes } from "../../../model/holidayModel";

// CREATE
export const createHolidayService = async (payload: HolidayCreationAttributes) => {
  try {
    const result = await holidayRepository.createHoliday(payload);
    return {
      success: true,
      message: "Holiday created successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// GET ALL
export const getHolidayService = async () => {
  try {
    const result = await holidayRepository.getHolidays();
    return {
      success: true,
      message: "Holidays fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// UPDATE
export const updateHolidayService = async (
  id: number,
  payload: HolidayCreationAttributes
) => {
  try {
    const result = await holidayRepository.updateHoliday(id, payload);
    return {
      success: true,
      message: "Holiday updated successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// DELETE
export const deleteHolidayService = async (id: number) => {
  try {
    const result = await holidayRepository.deleteHoliday(id);
    return {
      success: true,
      message: "Holiday deleted successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
