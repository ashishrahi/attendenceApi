import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

interface employeeTypeAttributes{
    id: number;
    employee_type: string,
    description: string,
    status: boolean
}
interface EmployeeTypeCreationAttributes extends Optional <employeeTypeAttributes, "id">{}

class EmployeeType extends Model <employeeTypeAttributes,EmployeeTypeCreationAttributes >

implements employeeTypeAttributes{
    public id! : number;
    public employee_type! : string ;
    public description! :string;
    public status!: boolean
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

EmployeeType.init({
    id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
    },
    employee_type:{
        type: DataTypes.STRING(255)
    },
    description:{
        type: DataTypes.STRING(255)
    },
    status: {
        type: DataTypes.BOOLEAN
    }
},
{
    sequelize,
    tableName: "employee_type",
    timestamps: true
}
)

export default EmployeeType;