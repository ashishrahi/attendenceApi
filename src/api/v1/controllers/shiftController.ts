import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { shiftService } from "../services";
import ShiftCreationAttributes from "../../model/shiftModel";

// Create Shift
export const createShiftController = async (
  req: Request<{}, {}, ShiftCreationAttributes>,
  res: Response
) => {
  try {
    const payload = req.body;

    const { success, message, data } = await shiftService.createShiftService(
      payload
    );

    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get Shifts
export const getShiftController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { success, message, data } = await shiftService.getShiftService(
      payload
    );

    res.status(StatusCodes.OK).json({
      success,
      message,
      data,
    });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update Shift
export const updateShiftController = async (
  req: Request,
  res: Response
) => {
  try {
    const id  = Number(req.params.id);
    const payload = req.body;
    const{success, message} = await shiftService.updateShiftService(id, payload)

    res.status(StatusCodes.OK).json({ success, message });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete Shift
export const deleteShiftController = async (req: Request<{ id: number }>,res: Response) => {
  try {
    const { id } = req.params;
    const {success, message, data} = await shiftService.deleteShiftService(id);

    res.status(StatusCodes.OK).json({success, message, data})
  } catch (error: any) {
    console.error("Error in deleteShift:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
