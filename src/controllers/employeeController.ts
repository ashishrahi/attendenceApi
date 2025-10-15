import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { employeeService } from "../services/index";

// Create Employee
export const createEmployeeController = async (
  req: Request,
  res: Response
) => {
  try {
    const payload = req.body;
    const { succuss, message, data } =
      await employeeService.createEmployeeService(payload);

    res.status(StatusCodes.CREATED).json({ succuss, message, data });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all Employee
export const getEmployeeController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { succuss, message, data } = await employeeService.getEmployeeService(
      payload
    );
    res.status(StatusCodes.OK).json({ succuss, message, data });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete Persona
export const deleteEmployeeController = async (req: Request, res: Response) => {
  try {
    const id  = Number(req.params.id);
    const { succuss, message } = await employeeService.deleteEmployeeService(
      id
    );

    res.status(StatusCodes.OK).json({ succuss, message });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update Employee
export const updateEmployeeController = async (req: Request, res: Response) => {
  try {
    const id  = Number(req.params.id);
    const payload = req.body;
    const { succuss, message, data } =
      await employeeService.updateEmployeeService(id, payload);

    res.status(StatusCodes.OK).json({ succuss, message, data });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
