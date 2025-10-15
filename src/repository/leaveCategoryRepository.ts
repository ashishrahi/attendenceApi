// repositories/leaveCategoryRepository.ts
import LeaveCategory, { LeaveCategoryCreationAttributes } from "../model/LeaveCategory";

export const leaveCategoryRepository = {
  async create(payload: LeaveCategoryCreationAttributes) {
    return await LeaveCategory.create(payload);
  },

  async findAll() {
    return await LeaveCategory.findAll({ order: [["createdAt", "DESC"]] });
  },

  async findById(id: number) {
    return await LeaveCategory.findByPk(id);
  },

  async update(id: number, payload: LeaveCategoryCreationAttributes) {
    const record = await LeaveCategory.findByPk(id);
    if (!record) throw new Error("Leave category not found");

    await record.update(payload);
    return record;
  },

  async delete(id: number) {
    const record = await LeaveCategory.findByPk(id);
    if (!record) throw new Error("Leave category not found");

    await record.destroy();
    return { id };
  },
};
