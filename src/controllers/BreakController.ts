import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { breakService } from "../services";

// create
export const createBreakController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { success, message, data } = await breakService.createBreakService(
      payload
    );

    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in createBreak:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// READ
export const getBreaksController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { success, message, data } = await breakService.getBreakService(payload);
    res.status(StatusCodes.OK).json({success, message, data})
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// UPDATE
export const updateBreakController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body;
    const { success, message, data } = await breakService.updateBreakService(id, payload);
    res.status(StatusCodes.OK).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in updateBreak:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE
export const deleteBreakController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { success, message} = await breakService.deleteBreakService(
      id
    );
    res.status(StatusCodes.OK).json({ success, message});
  } catch (error: any) {
    console.error("Error in deleteBreak:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
