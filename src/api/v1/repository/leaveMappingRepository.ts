import {LeaveMappingEmployee} from "../../../model/leaveMappingEmployeeModel";
import {LeaveMappingEmployeeTypeAttributes} from "../../../model/leaveMappingEmployeeModel";

export const leaveMappingRepository = {
  
// CREATE
  createLeaveMapping: async (payload: LeaveMappingEmployeeTypeAttributes) => {
    const newLeaveMapping = await LeaveMappingEmployee.create(payload);
    return newLeaveMapping;
  },

  // GET
  getLeaveMapping: async (payload?: Partial<LeaveMappingEmployeeTypeAttributes>) => {
    return await LeaveMappingEmployee.findAll({
      where: payload || {}, // allows optional filtering
    });
  },

  // UPDATE
  updateLeaveMapping: async (id: number, payload: LeaveMappingEmployeeTypeAttributes) => {
    const [affectedRows] = await LeaveMappingEmployee.update(payload, {
      where: { id },
      returning: true,
    });

    if (affectedRows === 0) {
      throw new Error("Leave mapping not found");
    }

    // Optionally fetch updated record
    const updatedLeaveMapping = await LeaveMappingEmployee.findByPk(id);
    return updatedLeaveMapping;
  },

  // DELETE
  deleteLeaveMapping: async (id: number) => {
    const deletedRows = await LeaveMappingEmployee.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      throw new Error("Leave mapping not found");
    }

    return deletedRows;
  },
};
