import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";
import { WardAttributes } from "../types/wardTypes";

// Attributes required when creating
interface WardCreationAttributes extends Optional<WardAttributes, "id"> {}

class Ward extends Model<WardAttributes, WardCreationAttributes>
  implements WardAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public zone_id!: number;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Ward.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
     code: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    zone_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ward", // Updated table name
    timestamps: true,
  }
);

export default Ward;
