import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { genderService } from "../services";

// CREATE Gender
export const createGender = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { success, message, data } = await genderService.createGenderService(
      payload
    );
    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in createGender:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// UPDATE Gender
export const updateGender = async (req: Request, res: Response) => {
  try {
    const id =  Number(req.params.id)
    const payload = req.body;
    const { success, message, data } = await genderService.updateGenderService(
      id,
      payload
    );
    res.status(StatusCodes.OK).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in updateGender:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET all Genders
export const getGender = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { success, message, data } = await genderService.getGenderService(
      payload
    );
res.status(StatusCodes.OK).json({
      success,
      message,
      data,
    });
  } catch (error: any) {
    console.error("Error in getGender:", error);
    res
      .status(StatusCodes.OK)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE Gender
export const deleteGender = async (req: Request, res: Response) => {
  try {
    const id =  Number(req.params.id)
    const{success, data, message} = await genderService.deleteGenderService(id)
    res.status(StatusCodes.OK).json({success, data, message})

  } catch (error: any) {
    console.error("Error in deleteGender:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
