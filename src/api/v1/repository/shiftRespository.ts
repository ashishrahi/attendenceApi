import Shift from "../../../model/shiftModel";
import ShiftCreationAttributes from "../../../model/shiftModel";

export const shiftRespository = {
  // create
  createShift: async (payload: ShiftCreationAttributes) => {
    const newShift = await Shift.create(payload);
    return newShift;
  },
  // get
  getShift: async ( payload: ShiftCreationAttributes) => {
    return await Shift.findAll();
  },
  // update
  updateShift: async (
    id: number,
    payload: ShiftCreationAttributes
  ) => {
    const [affectedRows] = await Shift.update(payload, {
      where: { id },
      returning: true,
    });
    if (affectedRows === 0) {
      throw new Error("Shift not found");
    }
    // Optionally fetch updated row
    const updatedShift = await Shift.findByPk(id);
    return updatedShift;
  },
  // delete
  deleteShift: async (id: number) => {
const deletedRows = await Shift.destroy({
        where: { id },
    });
     if (deletedRows === 0) {
        throw new Error("shift not found");
    }
    return deletedRows;
  },
};
