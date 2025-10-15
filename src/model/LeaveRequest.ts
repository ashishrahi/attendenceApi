import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

export interface LeaveRequestAttributes {
  id: number;
  employee_id: number;
  leavetype_id: number;
  FromDate: Date;
  ToDate: Date;
  Reason?: string;
  Status: string;
  TotalDays: number;
  ApprovedDays?: number;
  AppliedDate: Date;
  ApprovedBy?: number;
  ApprovedDate?: Date;
  RejectionRemark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface LeaveRequestCreationAttributes
  extends Optional<
    LeaveRequestAttributes,
    | "id"
    | "ApprovedDays"
    | "ApprovedBy"
    | "ApprovedDate"
    | "RejectionRemark"
    | "createdAt"
    | "updatedAt"
  > {}

// -----------------------------
// 3. Model Definition
// -----------------------------
class LeaveRequest
  extends Model<LeaveRequestAttributes, LeaveRequestCreationAttributes>
  implements LeaveRequestAttributes
{
  public id!: number;
  public employee_id!: number;
  public leavetype_id!: number;
  public FromDate!: Date;
  public ToDate!: Date;
  public Reason?: string;
  public Status!: string;
  public TotalDays!: number;
  public ApprovedDays?: number;
  public AppliedDate!: Date;
  public ApprovedBy?: number;
  public ApprovedDate?: Date;
  public RejectionRemark?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// -----------------------------
// 4. Sequelize Table Mapping
// -----------------------------
LeaveRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    leavetype_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    FromDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ToDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    Reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    Status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Pending",
    },
    TotalDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ApprovedDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    AppliedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ApprovedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ApprovedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    RejectionRemark: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "LeaveApplication", // MSSQL table name
    timestamps: true,
    underscored: true,
  }
);

export default LeaveRequest;
