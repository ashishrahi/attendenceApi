import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { leaveBalanceService } from "../services";

// CREATE Leave Balance
export const createLeaveBalanceController = async (
  req: Request,
  res: Response
) => {
  try {
    const payload = req.body;
    const { success, message, data } =
      await leaveBalanceService.createLeaveBalanace(payload);

    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    console.error("Error creating leave balance:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// UPDATE Leave Balance
export const updateLeaveBalanceController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id)
    const payload = req.body;
    const{success, message} = await leaveBalanceService.updateLeaveService(id, payload)
    res
      .status(StatusCodes.CREATED)
      .json({ success, message });
  } catch (error: any) {
    console.error("Error updating leave balance:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET Leave Balance (with PDF/Excel export)
export const getLeaveBalanceController = async (
  req: Request,
  res: Response
) => {
 

  try {
    const payload = req.body;
    const{success, message} = await leaveBalanceService.getLeaveService()

    return res.status(StatusCodes.OK).json({ success, message });
  } catch (error: any) {
    console.error("Error occurred while fetching leave balance:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE Leave Balance
export const deleteLeaveBalanceController = async (
  req: Request,
  res: Response
) => {
 
  try {
   const id = Number(req.params.id)
   const{success, message} = await leaveBalanceService.deleteLeaveService(id)
    res
      .status(StatusCodes.OK)
      .json({ success, message });
  } catch (error: any) {
    console.error("Error deleting leave balance:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
