import Zone, { ZoneAttributes } from "../../../model/zoneModel";

export const zoneRepository = {
  // CREATE
  createZone: async (payload: ZoneAttributes) => {
    const newZone = await Zone.create(payload);
    return newZone;
  },

  // GET ALL
  getZones: async (payload?: ZoneAttributes) => {
    return await Zone.findAll();
  },

  // UPDATE
  updateZone: async (id: number, payload: ZoneAttributes) => {
    const [affectedRows] = await Zone.update(payload, {
      where: { id },
      returning: true,
    });

    if (affectedRows === 0) {
      throw new Error("Zone not found");
    }

    const updatedZone = await Zone.findByPk(id);
    return updatedZone;
  },

  // DELETE
  deleteZone: async (id: number) => {
    const deletedRows = await Zone.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      throw new Error("Zone not found");
    }

    return deletedRows;
  },
};
