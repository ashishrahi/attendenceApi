import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

// ----- LeaveMappingEmployeeType -----
export interface LeaveMappingEmployeeTypeAttributes {
  id: number;
  LeaveTypeId: number;
  EmployeeId: number;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

interface LeaveMappingEmployeeTypeCreationAttributes
  extends Optional<LeaveMappingEmployeeTypeAttributes, "id" | "CreatedAt" | "UpdatedAt"> {}

class LeaveMappingEmployeeType
  extends Model<LeaveMappingEmployeeTypeAttributes, LeaveMappingEmployeeTypeCreationAttributes>
  implements LeaveMappingEmployeeTypeAttributes
{
  public id!: number;
  public LeaveTypeId!: number;
  public EmployeeId!: number;

  public readonly CreatedAt!: Date;
  public readonly UpdatedAt!: Date;
}

LeaveMappingEmployeeType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    LeaveTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    EmployeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "LeaveMappingEmployeeType",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

// ----- LeaveMappingEmployee -----
export interface LeaveMappingEmployeeAttributes {
  id: number;
  LeaveTypeId: number;
  EmployeeId: number;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

interface LeaveMappingEmployeeCreationAttributes
  extends Optional<LeaveMappingEmployeeAttributes, "id" | "CreatedAt" | "UpdatedAt"> {}

class LeaveMappingEmployee
  extends Model<LeaveMappingEmployeeAttributes, LeaveMappingEmployeeCreationAttributes>
  implements LeaveMappingEmployeeAttributes
{
  public id!: number;
  public LeaveTypeId!: number;
  public EmployeeId!: number;

  public readonly CreatedAt!: Date;
  public readonly UpdatedAt!: Date;
}

LeaveMappingEmployee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    LeaveTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    EmployeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "LeaveMappingEmployee",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

export { LeaveMappingEmployeeType, LeaveMappingEmployee };
