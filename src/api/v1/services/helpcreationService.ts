import { helpCreationRepository } from "../repository/index";
import { handleUnknownError } from "../../../utilities/helper/handleUnknownError";
import { HelpCreationAttributes } from "../../../model/helpCreationModel";

// CREATE
export const createHelpCreationService = async (payload: HelpCreationAttributes) => {
  try {
    const result = await helpCreationRepository.create(payload);
    return {
      success: true,
      message: "Help creation record created successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// GET ALL
export const getHelpCreationService = async () => {
  try {
    const result = await helpCreationRepository.findAll();
    return {
      success: true,
      message: "Help creation records fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// GET BY ID
export const getHelpCreationByIdService = async (id:number) => {
  try {
    const result = await helpCreationRepository.findById(id);
    if (!result) throw new Error("Help creation record not found");
    return {
      success: true,
      message: "Help creation record fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// UPDATE
export const updateHelpCreationService = async (
  id: number,
  payload: HelpCreationAttributes
) => {
  try {
    const result = await helpCreationRepository.update(id, payload);
    return {
      success: true,
      message: "Help creation record updated successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// DELETE
export const deleteHelpCreationService = async (id: number) => {
  try {
    const result = await helpCreationRepository.delete(id);
    return {
      success: true,
      message: "Help creation record deleted successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
