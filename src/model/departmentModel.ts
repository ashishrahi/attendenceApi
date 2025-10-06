import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/dbConfig";

interface DepartmentAttributes{
    id: number,
    name: string,
    code: string
}

interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, "id">{}
class Department extends Model <DepartmentAttributes, DepartmentCreationAttributes>
implements DepartmentAttributes{
    public id! : number;
    public name! : string;
    public code! : string;
     public readonly createdAt!: Date;
   public readonly updatedAt!: Date;

}
Department.init({
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
    name:{
        type: DataTypes.STRING(255),
    },
    code:{
        type: DataTypes.STRING(255),
    },
   
},
 {
        sequelize,
            tableName:"department",
            timestamps: true
    }
)
export default Department;