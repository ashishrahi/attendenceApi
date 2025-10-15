// services/roleService.ts
import { roleRepository } from "../repository/index";
import { handleUnknownError } from "../utilities/helper/handleUnknownError";
import Role, { RoleCreationAttributes } from "../model/roleModel";

// CREATE
export const createRoleService = async (payload: RoleCreationAttributes) => {
  try {
    const result = await roleRepository.create(payload);
    return {
      success: true,
      message: "Role created successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// GET ALL
export const getRoleService = async () => {
  try {
    const result = await roleRepository.findAll();
    return {
      success: true,
      message: "Roles fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// GET BY ID
export const getRoleByIdService = async (id: number) => {
  try {
    const result = await roleRepository.findById(id);
    if (!result) {
      return { success: false, message: "Role not found" };
    }
    return {
      success: true,
      message: "Role fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// UPDATE
export const updateRoleService = async (id: number, payload: RoleCreationAttributes) => {
  try {
    const result = await roleRepository.update(id, payload);
    return {
      success: true,
      message: "Role updated successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// DELETE
export const deleteRoleService = async (id: number) => {
  try {
    const result = await roleRepository.delete(id);
    return {
      success: true,
      message: "Role deleted successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
