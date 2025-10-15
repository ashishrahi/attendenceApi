import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

export interface HelpCreationAttributes {
  id: number;
  menuId: string;
  menuName: string;
  description: string;
  status: boolean;
}

export interface HelpCreationCreationAttributes
  extends Optional<HelpCreationAttributes, "id"> {}

class HelpCreation
  extends Model<HelpCreationAttributes, HelpCreationCreationAttributes>
  implements HelpCreationAttributes
{
  public id!: number;
  public menuId!: string;
  public menuName!: string;
  public description!: string;
  public status!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

HelpCreation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    menuId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    menuName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "help_creation",
    timestamps: true,
  }
);

export default HelpCreation;
