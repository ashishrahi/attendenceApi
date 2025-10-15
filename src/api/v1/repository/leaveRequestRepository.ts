import LeaveRequest, { LeaveRequestCreationAttributes } from "../../../model/LeaveRequest";

export const leaveRequestRepository = {
  // Create a new leave request
  async create(payload: LeaveRequestCreationAttributes) {
    return await LeaveRequest.create(payload);
  },

  // Get all leave requests, sorted by most recent
  async findAll() {
    return await LeaveRequest.findAll({ order: [["createdAt", "DESC"]] });
  },

  // Get a specific leave request by ID
  async findById(id: number) {
    return await LeaveRequest.findByPk(id);
  },

  // Update a specific leave request
  async update(id: number, payload: LeaveRequestCreationAttributes) {
    const record = await LeaveRequest.findByPk(id);
    if (!record) throw new Error("Leave request not found");

    await record.update(payload);
    return record;
  },

  // Delete a specific leave request
  async delete(id: number) {
    const record = await LeaveRequest.findByPk(id);
    if (!record) throw new Error("Leave request not found");

    await record.destroy();
    return { id };
  },
};
