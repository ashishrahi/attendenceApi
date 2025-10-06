import Ward from "../model/wardModel";

export interface WardAttributes {
  id: number;
  name: string;
  code: string;
  zone_id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export const wardRepository = {
  // CREATE
  createWard: async (payload: WardAttributes) => {
    const newWard = await Ward.create(payload);
    return newWard;
  },

  // GET ALL
  getWards: async (payload?: WardAttributes) => {
    return await Ward.findAll();
  },

  // UPDATE
  updateWard: async (id: number, payload: WardAttributes) => {
    const [affectedRows] = await Ward.update(payload, {
      where: { id },
      returning: true,
    });

    if (affectedRows === 0) {
      throw new Error("Ward not found");
    }

    const updatedWard = await Ward.findByPk(id);
    return updatedWard;
  },

  // DELETE
  deleteWard: async (id: number) => {
    const deletedRows = await Ward.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      throw new Error("Ward not found");
    }

    return deletedRows;
  },
};
