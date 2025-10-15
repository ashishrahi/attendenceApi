import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { roleService } from "../services";
import { RoleCreationAttributes } from "../../model/roleModel";

// Create Role
export const createRoleController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { success, message, data } = await roleService.createRoleService(
      payload
    );
    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in createRole:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update Role
export const updateRoleController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body;
    const { success, message, data } = await roleService.updateRoleService(
      id,
      payload
    );
    res.status(StatusCodes.OK).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in updateRole:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all Roles
export const getRoleController = async (req: Request, res: Response) => {
  try {
    const { success, message, data } = await roleService.getRoleService();
    res.status(StatusCodes.OK).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in getRole:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Role
export const deleteRoleController = async (req: Request, res: Response) => {
  try {
    const payload = Number(req.params.id);
    const { success, message, data } = await roleService.deleteRoleService(
      payload
    );
    res.status(StatusCodes.OK).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in deleteRole:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
