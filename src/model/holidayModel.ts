import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig"; // adjust path if needed

// 1️⃣ Attributes in DB
export interface HolidayAttributes {
  id: number;
  HolidayName: string;
  Description?: string;
  Date: Date;
  IsActive: boolean;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

// 2️⃣ Attributes required when creating
export interface HolidayCreationAttributes
  extends Optional<HolidayAttributes, "id" | "CreatedAt" | "UpdatedAt"> {}

// 3️⃣ Sequelize model
class Holiday extends Model<HolidayAttributes, HolidayCreationAttributes>
  implements HolidayAttributes {
  public id!: number;
  public HolidayName!: string;
  public Description?: string;
  public Date!: Date;
  public IsActive!: boolean;
  public readonly CreatedAt!: Date;
  public readonly UpdatedAt!: Date;
}

// 4️⃣ Initialize model
Holiday.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    HolidayName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    Date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "holiDaySchedule",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

export default Holiday;
