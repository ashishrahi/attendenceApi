export interface RolePermission {
  menuId: number;
  parentId?: number;
  isAdd?: boolean;
  isEdit?: boolean;
  isDel?: boolean;
  isView?: boolean;
  isPrint?: boolean;
  isExport?: boolean;
  isRelease?: boolean;
  isPost?: boolean;
}