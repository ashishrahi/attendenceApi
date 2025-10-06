export interface ApplyLeaveInput {
  employeeId: number;
  leaveTypeId: number;
  fromDate: string | Date;
  toDate: string | Date;
  reason: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
}

export interface UpdateLeaveStatusInput {
  status: 'Approved' | 'Rejected';
  approvedBy: number;
  remark?: string;
  approvedDays?: number;
}