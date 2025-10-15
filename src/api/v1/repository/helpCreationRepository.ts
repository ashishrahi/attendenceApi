import HelpCreation, {
  HelpCreationCreationAttributes,
} from "../../../model/helpCreationModel";

export const helpCreationRepository = {
  async create(payload: HelpCreationCreationAttributes) {
    return await HelpCreation.create(payload);
  },

  async findAll() {
    return await HelpCreation.findAll({ order: [["createdAt", "DESC"]] });
  },

  async findById(id: number) {
    return await HelpCreation.findByPk(id);
  },

  async update(id: number, payload: HelpCreationCreationAttributes) {
    const record = await HelpCreation.findByPk(id);
    if (!record) throw new Error("Help creation record not found");

    await record.update(payload);
    return record;
  },

  async delete(id: number) {
    const record = await HelpCreation.findByPk(id);
    if (!record) throw new Error("Help creation record not found");

    await record.destroy();
    return { id };
  },
};
