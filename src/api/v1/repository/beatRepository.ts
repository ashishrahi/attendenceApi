import Beat from "../../../model/beatModel";
import BeatCreationAttributes from "../../../model/beatModel";

export const beatRepository = {
  // create
  createBeat: async (payload: BeatCreationAttributes) => {
    const newBeat = await Beat.create(payload);
    return newBeat;
  },
  // get
  getBeat: async () => {
    return await Beat.findAll();
  },
  // update
  updateBeat: async (id: number, payload: BeatCreationAttributes) => {
    const [affectedRows] = await Beat.update(payload, {
      where: { id },
      returning: true,
    });

    if (affectedRows === 0) {
      throw new Error("Beat not found");
    }

    // Optionally fetch updated row
    const updatedBeat = await Beat.findByPk(id);
    return updatedBeat;
  },
  // delete
  deleteBeat: async (id: number) => {
    const deletedRows = await Beat.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      throw new Error("Beat not found");
    }

    return deletedRows;
  },
};
