import LeaveType, { LeaveTypeCreationAttributes } from "../model/leaveTypeModel";

export const leaveTypeRepository = {
  async create(payload: LeaveTypeCreationAttributes) {
    return await LeaveType.create(payload);
  },

  async findAll() {
    return await LeaveType.findAll({ order: [["createdAt", "DESC"]] });
  },

  async findById(id: number) {
    return await LeaveType.findByPk(id);
  },

  async update(id: number, payload: LeaveTypeCreationAttributes) {
    const record = await LeaveType.findByPk(id);
    if (!record) throw new Error("Leave type not found");

    await record.update(payload);
    return record;
  },

  async delete(id: number) {
    const record = await LeaveType.findByPk(id);
    if (!record) throw new Error("Leave type not found");

    await record.destroy();
    return { id };
  },
};
