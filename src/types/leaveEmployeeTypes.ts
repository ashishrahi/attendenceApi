export interface LeaveMappingEmployeeType {
  MappingId: number;
  LeaveTypeId: number;
  EmployeeTypeId: number;
  CreatedAt: Date;
}

export interface LeaveMappingEmployee {
  MappingId: number;
  LeaveTypeId: number;
  EmployeeId: number;
  CreatedAt: Date;
}