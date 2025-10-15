// models/Employee.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

// Import referenced models (assuming they exist)
import Department from "../model/departmentModel";
import Designation from "../model/designationModel";
import Zone from "../model/zoneModel";
import Ward from "../model/wardModel";
import Area from "../model/areaModel";
import Beat from "../model/beatModel";
import Gender from "../model/genderModel";
import Shift from "../model/shiftModel";
import Break from "../model/breakModel";
import EmployeeType from "../model/employeeTypeModel";

export interface EmployeeAttributes {
  id: number;
  user_id: number;
  department_id: number;
  designation_id: number;
  zone_id: number;
  ward_id: number;
  area_id: number;
  beat_id: number;
  gender_id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  father_name?: string;
  mother_name?: string;
  email: string;
  phone: string;
  address?: string;
  date_of_birth: Date;
  shift_id: number;
  break_id: number;
  employee_type_id: number;
}

export interface EmployeeCreationAttributes
  extends Optional<EmployeeAttributes, "id"> {}

class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  public id!: number;
  public user_id!: number;
  public department_id!: number;
  public designation_id!: number;
  public zone_id!: number;
  public ward_id!: number;
  public area_id!: number;
  public beat_id!: number;
  public gender_id!: number;
  public first_name!: string;
  public middle_name?: string;
  public last_name!: string;
  public father_name?: string;
  public mother_name?: string;
  public email!: string;
  public phone!: string;
  public address?: string;
  public date_of_birth!: Date;
  public shift_id!: number;
  public break_id!: number;
  public employee_type_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Department,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    designation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Designation,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    zone_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Zone,
        key: "id",
      },
    },
    ward_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Ward,
        key: "id",
      },
    },
    area_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Area,
        key: "id",
      },
    },
    beat_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Beat,
        key: "id",
      },
    },
    gender_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Gender,
        key: "id",
      },
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    middle_name: DataTypes.STRING,
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    father_name: DataTypes.STRING,
    mother_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [10, 15],
      },
    },
    address: DataTypes.STRING,
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    shift_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Shift,
        key: "id",
      },
    },
    break_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Break,
        key: "id",
      },
    },
    employee_type_id: {
      type: DataTypes.INTEGER,
      references: {
        model: EmployeeType,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "employees",
    timestamps: true,
    underscored: true,
  }
);

export default Employee;
