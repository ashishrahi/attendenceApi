import LeaveBalance, { LeaveBalanceCreationAttributes } from "../../../model/LeaveBalance";

export const leaveBalanceRepository = {
  // Create a new leave balance
  async create(payload: LeaveBalanceCreationAttributes) {
    return await LeaveBalance.create(payload);
  },

  // Get all leave balances
  async findAll() {
    return await LeaveBalance.findAll({
      order: [["createdAt", "DESC"]],
    });
  },

  // Find leave balance by ID
  async findById(id: number) {
    return await LeaveBalance.findByPk(id);
  },

  // Find leave balance by employeeId and leaveTypeId
  async findByEmployeeAndType(employeeId: number, leaveTypeId: number) {
    return await LeaveBalance.findOne({
      where: { employeeId, leaveTypeId },
    });
  },

  // Update leave balance by ID
  async update(id: number, payload: Partial<LeaveBalanceCreationAttributes>) {
    const record = await LeaveBalance.findByPk(id);
    if (!record) throw new Error("Leave balance not found");

    await record.update(payload);
    return record;
  },

  // Delete leave balance by ID
  async delete(id: number) {
    const record = await LeaveBalance.findByPk(id);
    if (!record) throw new Error("Leave balance not found");

    await record.destroy();
    return { id };
  },
};
