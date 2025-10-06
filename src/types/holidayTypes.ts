export interface HolidayInput {
  ID?: number;
  HolidayName: string;
  Description?: string;
  Date: string | Date;
  IsActive?: boolean;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}