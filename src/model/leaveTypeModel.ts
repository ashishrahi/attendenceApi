import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

export interface LeaveTypeAttributes {
  id: number;
  name: string;
  description?: string;
  maxDays: number;
  status: "Active" | "Inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeaveTypeCreationAttributes
  extends Optional<LeaveTypeAttributes, "id" | "createdAt" | "updatedAt"> {}

export class LeaveType
  extends Model<LeaveTypeAttributes, LeaveTypeCreationAttributes>
  implements LeaveTypeAttributes
{
  public id!: number;
  public name!: string;
  public description?: string;
  public maxDays!: number;
  public status!: "Active" | "Inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LeaveType.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    maxDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
      defaultValue: "Active",
    },
  },
  {
    sequelize,
    tableName: "leave_types",
    timestamps: true,
  }
);

export default LeaveType;
