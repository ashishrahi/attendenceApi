import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { leaveTypeService } from "../services";

// CREATE LEAVE TYPE
export const createLeaveTypeController = async (
  req: Request,
  res: Response
) => {
  try {
    const payload = req.body;
    const { success, message, data } =
      await leaveTypeService.createLeaveTypeService(payload);
    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET ALL LEAVE TYPES
export const getLeaveTypesController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { success, message, data } =
      await leaveTypeService.getLeaveTypeService(payload);
    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// UPDATE LEAVE TYPE
export const updateLeaveTypeController = async (
  req: Request,
  res: Response
) => {
  try {
    const payload = req.body;
    const id = Number(req.params.id);
    const { success, message, data } =
      await leaveTypeService.updateLeaveTypeService(id, payload);

    res.status(StatusCodes.OK).json({ success, message, data });
  } catch (error: any) {
    console.error("Error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE LEAVE TYPE
export const deleteLeaveTypeController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const { success, message, data } =
      await leaveTypeService.deleteLeaveTypeService(id);
    res
      .status(200)
      .json({ success, message, data });
  } catch (error: any) {
    console.error("Error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
