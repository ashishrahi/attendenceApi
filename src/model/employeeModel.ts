import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

interface EmployeeAttributes {
  id: number;
  userid: number;
  department_id: number;
  designation_id: number;
  zone_id: number;
  ward_id: number;
  area_id: number;
  beat_id: number;
  gender_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  email: string;
  phone: number;
  address: string;
  date_of_birth: string;
  shift_id: number;
  break_id: number;
  employee_type_id: number;
}
interface EmployeeCreationAttributes
  extends Optional<EmployeeAttributes, "id"> {}
class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  public id!: number;
  public userid!: number;
  public department_id!: number;
  public designation_id!: number;
  public zone_id!: number;
  public ward_id!: number;
  public area_id!: number;
  public beat_id!: number;
  public gender_id!: number;
  public first_name!: string;
  public middle_name!: string;
  public last_name!: string;
  public father_name!: string;
  public mother_name!: string;
  public email!: string;
  public phone!: number;
  public address!: string;
  public date_of_birth!: string;
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
      allowNull: false,
    },
    userid: {
      type: DataTypes.INTEGER,
    },
    department_id: {
      type: DataTypes.INTEGER,
    },
    designation_id: {
      type: DataTypes.INTEGER,
    },
    zone_id: {
      type: DataTypes.INTEGER,
    },
    ward_id: {
      type: DataTypes.INTEGER,
    },
    area_id: {
      type: DataTypes.INTEGER,
    },
    beat_id: {
      type: DataTypes.INTEGER,
    },
    gender_id: {
      type: DataTypes.INTEGER,
    },
    first_name: {
      type: DataTypes.STRING,
    },
    middle_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    father_name: {
      type: DataTypes.STRING,
    },
    mother_name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.INTEGER,
    },
    address: {
      type: DataTypes.STRING,
    },
    date_of_birth: {
      type: DataTypes.DATE,
    },
    shift_id: {
      type: DataTypes.INTEGER,
    },
    break_id: {
      type: DataTypes.INTEGER,
    },
    employee_type_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    tableName: "employee",
    timestamps: true,
  }
);

export default Employee;
