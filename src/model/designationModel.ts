import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

interface DesignationAttributes{
    id: number,
    name: string,
    code: string,
}
interface DesignationCreationAttributes extends Optional<DesignationAttributes, "id">{}
class Designation extends Model <DesignationAttributes, DesignationCreationAttributes>
implements DesignationAttributes{
    public id! : number
    public name! : string 
    public code! :string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}
Designation.init({
    id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
    },
    name:{
        type: DataTypes.STRING(255)
    },
    code:{
        type: DataTypes.STRING(255)
    }
},
{
    sequelize,
    tableName: "designation",
    timestamps: true
}
)

export default Designation;