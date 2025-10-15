// models/Role.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

export interface RoleAttributes {
  id: number;
  rolename: string;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public rolename!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rolename: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "d07_rolemaster",
    timestamps: true,  
    underscored: true,
  }
);

export default Role;
