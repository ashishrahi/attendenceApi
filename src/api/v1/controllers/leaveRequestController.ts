import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { leaveRequestService } from "../services";

// APPLY LEAVE
export const createLeaveController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { success, message, data } =
      await leaveRequestService.createLeaveService(payload);
    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred.",
      error: error.message,
    });
  }
};

// UPDATE LEAVE STATUS
export const updateLeaveStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body;
    const { success, message, data } =
      await leaveRequestService.updateLeaveService(id, payload);

    res.status(StatusCodes.OK).json({
      success,
      message,
    });
  } catch (error: any) {
    console.error("Error updating leave status:", error);

    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
// GET ALL LEAVE APPLICATIONS
export const getAllLeaveApplicationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { success, message, data } =
      await leaveRequestService.getLeaveService();

    res.status(StatusCodes.OK).json({
      success,
      message,
      data,
    });
  } catch (error: any) {
    console.error("Error fetching leave applications:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET LEAVE APPLICATION BY ID
export const getLeaveApplicationByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const { success, message, data } =
      await leaveRequestService.getbyIdLeaveService(id);
    res.status(StatusCodes.OK).json({ success, message, data });
  } catch (error: any) {
    console.error("Error fetching leave application:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE LEAVE APPLICATION
export const deleteLeaveApplicationController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const { success, message } =
      await leaveRequestService.deleteLeaveService(id);

    res.status(StatusCodes.OK).json({
      success,
      message,
    });
  } catch (error: any) {
    console.error("Error deleting leave application:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
