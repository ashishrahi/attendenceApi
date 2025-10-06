export interface Permission {
  UserId: number | string;
  MenuId: number;
  ParentId?: number;
  IsAdd?: boolean;
  IsEdit?: boolean;
  IsDel?: boolean;
  IsView?: boolean;
  IsPrint?: boolean;
  IsExport?: boolean;
  IsRelease?: boolean;
  IsPost?: boolean;
}