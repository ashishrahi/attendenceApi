export interface UserPermissions {
  MenuId: number;
  ParentId?: number | null;
  IsAdd: boolean;
  IsEdit: boolean;
  IsDel: boolean;
  IsView: boolean;
  IsPrint: boolean;
  IsExport: boolean;
  IsRelease: boolean;
  IsPost: boolean;
}

export interface CreateUserBody {
  loginName: string;
  password: string;
  roleId: number;
  permissions?: UserPermissions[];
  surName?: string;
  firstName?: string;
  middleName?: string;
  shortName?: string;
  userCode?: string;
  dob?: string;
  doa?: string;
  doj?: string;
  genderId?: number;
  curPhone?: string;
  curMobile?: string;
  email?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  userTypeId?: number;
  otp?: string;
  isSystem?: boolean;
  orgId?: string;
  employeeId?: number;
  EmployeeUserId?: number;
}