import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

// Define the attributes interface
interface ShiftAttributes {
  id: number;
  shift_name: string;
  intime: string;   
  outtime: string;  
  status: boolean;
}

// Optional fields for creation
interface ShiftCreationAttributes extends Optional<ShiftAttributes, "id"> {}

// Define the Shift model
class Shift extends Model<ShiftAttributes, ShiftCreationAttributes> implements ShiftAttributes {
  public id!: number;
  public shift_name!: string;
  public intime!: string;
  public outtime!: string;
  public status!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Shift.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shift_name: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    intime: {
      type: DataTypes.TIME,
      allowNull: false, 
    },
    outtime: {
      type: DataTypes.TIME,
      allowNull: false, 
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, 
    },
  },
  {
    sequelize,
    tableName: "shift",
    timestamps: true, 
  }
);

export default Shift;
