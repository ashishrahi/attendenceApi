import Break, { BreakCreationAttributes } from "../model/breakModel";

export const breakRepository = {
  // CREATE
  createBreak: async (payload: BreakCreationAttributes) => {
    const newBreak = await Break.create(payload);
    return newBreak;
  },

  // GET ALL
  getBreaks: async (payload: BreakCreationAttributes) => {
    return await Break.findAll();
  },

  // UPDATE
  updateBreak: async (id: number, payload: BreakCreationAttributes) => {
    const [affectedRows] = await Break.update(payload, {
      where: { id },
      returning: true,
    });

    if (affectedRows === 0) {
      throw new Error("Break not found");
    }

    const updatedBreak = await Break.findByPk(id);
    return updatedBreak;
  },

  // DELETE
  deleteBreak: async (id: number) => {
    const deletedRows = await Break.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      throw new Error("Break not found");
    }

    return deletedRows;
  },
};
