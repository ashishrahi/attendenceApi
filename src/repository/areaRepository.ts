import Area, {AreaCreationAttributes} from "../model/areaModel";

export const areaRepository = {

  // CREATE
  createArea: async (payload: AreaCreationAttributes) => {
    const newArea = await Area.create(payload);
    return newArea;
  },

  // READ
  getAreas: async () => {
    return await Area.findAll();
  },

  // UPDATE
  updateArea: async (id: number, payload: AreaCreationAttributes) => {
    const [affectedRows] = await Area.update(payload, {
      where: { id },
      returning: true,
    });

    if (affectedRows === 0) {
      throw new Error("Area not found");
    }

    const updatedArea = await Area.findByPk(id);
    return updatedArea;
  },

  // DELETE
  deleteArea: async (id: number) => {
    const deletedRows = await Area.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      throw new Error("Area not found");
    }

    return deletedRows;
  },
};
