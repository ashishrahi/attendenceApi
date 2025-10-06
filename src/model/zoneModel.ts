import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

export interface ZoneAttributes {
  id: number;
  name: string;
  code: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Attributes required when creating
interface ZoneCreationAttributes extends Optional<ZoneAttributes, "id"> {}

class Zone
  extends Model<ZoneAttributes, ZoneCreationAttributes>
  implements ZoneAttributes
{
  public id!: number;
  public name!: string;
  public code!: string;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Zone.init(
  {
    id: {
      type: DataTypes.INTEGER, // or BIGINT
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "zone", // Table renamed
    timestamps: true,
  }
);

export default Zone;
