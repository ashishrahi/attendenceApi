import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

export interface AreaAttributes {
  id?: number;
  areaName: string;
  areaCode?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AreaCreationAttributes extends Optional<AreaAttributes, "id"> {}

class Area extends Model<AreaAttributes, AreaCreationAttributes> implements AreaAttributes {
  public id!: number;
  public areaName!: string;
  public areaCode?: string;
  public isActive?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Area.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    areaName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    areaCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "Areas",
    timestamps: true,
  }
);

export default Area;
