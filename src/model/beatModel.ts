import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

// Attributes in DB
export interface BeatAttributes {
  id: number;
  name: string;
  area_id: number;
}

// Attributes required when creating
export interface BeatCreationAttributes extends Optional<BeatAttributes, "id"> {}

class Beat extends Model<BeatAttributes, BeatCreationAttributes>
  implements BeatAttributes {
  public id!: number;
  public name!: string;
  public area_id!: number;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Beat.init(
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
    area_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "d06_beat",
    timestamps: true,
  }
);

export default Beat;
