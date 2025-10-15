import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { leaveCategoryService } from "../services";

// CREATE Leave Category
export const createLeaveCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const payload = req.body;
    const { success, message, data } =
      await leaveCategoryService.createLeaveCategoryService(payload);
    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in createLeaveCategory:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// UPDATE Leave Category
export const updateLeaveCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body;
    const { success, message, data } =
      await leaveCategoryService.updateLeaveCategoryService(id, payload);
    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in updateLeaveCategory:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET Leave Categories
export const getLeaveCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { success, message, data } =
      await leaveCategoryService.getLeaveCategoryService();
    res.status(StatusCodes.CREATED).json({ success, message, data });

  } catch (error: any) {
    console.error("Error in getLeaveCategory:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE Leave Category
export const deleteLeaveCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const{success, message} = await leaveCategoryService.deleteLeaveCategoryService(id)

    
  } catch (error: any) {
    console.error("Error in deleteLeaveCategory:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
