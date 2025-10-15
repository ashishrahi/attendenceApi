import EmployeeType from "../../../model/employeeTypeModel";
import employeeAttributes from "../../../model/employeeTypeModel";

export const employeeTypeRepository = {
  // CREATE
  createEmployeeType: async (payload: employeeAttributes) => {
    const newEmployeeType = await EmployeeType.create(payload);
    return newEmployeeType;
  },

  // GET ALL
  getEmployeeTypes: async (payload: employeeAttributes) => {
    return await EmployeeType.findAll();
  },

  // UPDATE
  updateEmployeeType: async (id: number, payload: employeeAttributes) => {
    const [affectedRows] = await EmployeeType.update(payload, {
      where: { id },
      returning: true,
    });

    if (affectedRows === 0) {
      throw new Error("Employee Type not found");
    }

    // Optionally fetch the updated record
    const updatedEmployeeType = await EmployeeType.findByPk(id);
    return updatedEmployeeType;
  },

  // DELETE
  deleteEmployeeType: async (id: number) => {
    const deletedRows = await EmployeeType.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      throw new Error("Employee Type not found");
    }

    return deletedRows;
  },
};
