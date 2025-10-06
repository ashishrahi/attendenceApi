import Holiday, { HolidayCreationAttributes } from "../model/holidayModel";

export const holidayRepository = {
  // CREATE
  createHoliday: async (payload: HolidayCreationAttributes) => {
    const newHoliday = await Holiday.create(payload);
    return newHoliday;
  },

  // GET ALL
  getHolidays: async () => {
    return await Holiday.findAll({ order: [["Date", "ASC"]] });
  },

  // UPDATE
  updateHoliday: async (id: number, payload: HolidayCreationAttributes) => {
    const [affectedRows] = await Holiday.update(payload, {
      where: { id: id },
      returning: true,
    });

    if (affectedRows === 0) {
      throw new Error("Holiday not found");
    }

    const updatedHoliday = await Holiday.findByPk(id);
    return updatedHoliday;
  },

  // DELETE
  deleteHoliday: async (id: number) => {
    const deletedRows = await Holiday.destroy({
      where: {id: id },
    });

    if (deletedRows === 0) {
      throw new Error("Holiday not found");
    }

    return deletedRows;
  },
};
