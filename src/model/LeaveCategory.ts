// models/LeaveCategory.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

export interface LeaveCategoryAttributes {
  id: number;
  categoryName: string;
  description?: string;
}

export interface LeaveCategoryCreationAttributes extends Optional<LeaveCategoryAttributes, "id"> {}

class LeaveCategory
  extends Model<LeaveCategoryAttributes, LeaveCategoryCreationAttributes>
  implements LeaveCategoryAttributes
{
  public id!: number;
  public categoryName!: string;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LeaveCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "LeaveCategory",
    timestamps: true,
    underscored: true,
  }
);

export default LeaveCategory;
