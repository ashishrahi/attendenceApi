export interface LeaveBalanceInput {
  employeeId: number;
  leaveTypeId: number;
  totalEntitled?: number;
  leaveTaken?: number;
  year?: number;
  effectiveDate?: string | Date;
}