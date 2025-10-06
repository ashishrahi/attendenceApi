import Department from "../model/departmentModel";
import DepartmentCreationAttributes from "../model/departmentModel";

export const departmentRepository = {
  // create
  createDepartment: async (payload: DepartmentCreationAttributes) => {
    const newDepartment = await Department.create(payload);
    return newDepartment;
  },
  // get
  getDepartment: async ( payload: DepartmentCreationAttributes) => {
    return await Department.findAll();
  },
  // update
  updateDepartment: async (
    id: number,
    payload: DepartmentCreationAttributes
  ) => {
    const [affectedRows] = await Department.update(payload, {
      where: { id },
      returning: true,
    });
    if (affectedRows === 0) {
      throw new Error("Beat not found");
    }
    // Optionally fetch updated row
    const updatedBeat = await Department.findByPk(id);
    return updatedBeat;
  },
  // delete
  deleteDepartment: async (id: number) => {
const deletedRows = await Department.destroy({
        where: { id },
    });
     if (deletedRows === 0) {
        throw new Error("Beat not found");
    }
    return deletedRows;
  },
};
