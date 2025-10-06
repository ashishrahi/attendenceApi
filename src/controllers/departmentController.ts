import { Request, Response } from "express";
import { departmentSerivce } from "../services/index";
import { StatusCodes } from "http-status-codes";
import { handleUnknownError } from "../utilities/helper/handleUnknownError";

// create
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { success, message, data } =
      await departmentSerivce.createDepartmentService(payload);
    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// get
export const getDepartment = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { success, message, data } =
      await departmentSerivce.getDepartmentService(payload);

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
// update
export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const id = Number(req.params.id)

    const { success, message, data } =
      await departmentSerivce.updateDepartmentService(id, payload);

    res.status(StatusCodes.OK).json({ success, message, data });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
// delete
export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {success, message, data} = await departmentSerivce.deleteDepartmentService(id)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success, message, data})
    
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: handleUnknownError(error) });
  }
};
