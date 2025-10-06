import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

interface genderAttributes {
  id: number;
  gender: Enumerator;
  status: boolean;
}
interface GenderCreationAttributes extends Optional<genderAttributes, "id"> {}

class GenderType
  extends Model<genderAttributes, GenderCreationAttributes>
  implements genderAttributes
{
  public id!: number;
  public gender!: Enumerator;
  public status!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GenderType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    gender: {
     type: DataTypes.ENUM('Male', 'Female', 'Other'),
       allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    sequelize,
    tableName: "gender_type",
    timestamps: true,
  }
);

export default GenderType;
