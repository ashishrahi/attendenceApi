import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

export interface LeaveBalanceAttributes {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  totalEntitled: number;
  leaveTaken: number;
  leaveRemaining?: number;
  year: number;
  effectiveDate: Date;
}

export interface LeaveBalanceCreationAttributes extends Optional<LeaveBalanceAttributes, "id" | "leaveRemaining"> {}

class LeaveBalance
  extends Model<LeaveBalanceAttributes, LeaveBalanceCreationAttributes>
  implements LeaveBalanceAttributes
{
  public id!: number;
  public employeeId!: number;
  public leaveTypeId!: number;
  public totalEntitled!: number;
  public leaveTaken!: number;
  public leaveRemaining?: number;
  public year!: number;
  public effectiveDate!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LeaveBalance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    leaveTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalEntitled: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    leaveTaken: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    leaveRemaining: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    effectiveDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "LeaveBalance",
    timestamps: true,
    underscored: true,
  }
);

export default LeaveBalance;
