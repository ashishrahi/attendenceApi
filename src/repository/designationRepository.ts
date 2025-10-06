import Designation from "../model/designationModel"
import DesignationAttributes from '../model/designationModel'
// create
export const designationRepository = {

createDesignation : async(payload:DesignationAttributes)=>{
const newDesignation = Designation.create(payload)
return newDesignation;
}, 

getDesignation : async(payload: DesignationAttributes)=>{
return await Designation.findAll()
}, 

updateDesignation : async(id:number, payload: DesignationAttributes)=>{
const [affectedRows] = await Designation.update(payload, {
    where: {id},
    returning: true,
});
 if (affectedRows === 0) {
      throw new Error("Designation not found");
    }
       // Optionally fetch updated row
    const updatedDesignation = await Designation.findByPk(id);
    return updatedDesignation;
},

deleteDesignation : async(id:number)=>{
const deletedRows = await Designation.destroy({
        where: { id },
    });
     if (deletedRows === 0) {
        throw new Error("Designation not found");
    }
    return deletedRows;
  },
}


