import Employee from "../../../model/employeeModel";
import employeeAttributes from "../../../model/employeeModel";

export const employeeRepository = {
  //  create
  createEmployee: async (payload: employeeAttributes) => {
    const newEmployee = await Employee.create(payload);
    return newEmployee;
  },
  // get
  getEmployee: async (payload: employeeAttributes) => {
    return await Employee.findAll();
  },
  // update
  updateEmployee: async (id: number, payload: employeeAttributes) => {
    const [affectedRows] = await Employee.update(payload, {
      where: { id },
      returning: true,
    });
    if (affectedRows === 0) {
      throw new Error("Employee not found");
    }
    // Optionally fetch updated row
    const updatedEmployee = await Employee.findByPk(id);
    return updatedEmployee;
  },
  // delete
  deleteEmployee: async (id:number) => {

    const deletedRows = await Employee.destroy({
        where: { id },
    });
     if (deletedRows === 0) {
        throw new Error("Employee not found");
    }
    return deletedRows;
  },
};
