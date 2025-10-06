import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

// 1️⃣ Attributes in DB
export interface BreakAttributes {
  id: number;
  IntervalMinutes: number;
  IntervalName: string;
  IsActive: boolean;
}

// 2️⃣ Attributes required when creating
export interface BreakCreationAttributes extends Optional<BreakAttributes, "id"> {}

// 3️⃣ Sequelize model
class Break extends Model<BreakAttributes, BreakCreationAttributes>
  implements BreakAttributes {
  public id!: number;
  public IntervalMinutes!: number;
  public IntervalName!: string;
  public IsActive!: boolean;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 4️⃣ Initialize model
Break.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    IntervalMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    IntervalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "BreakMaster",
    timestamps: true,
  }
);

export default Break;
