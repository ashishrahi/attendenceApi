import GenderType from "../model/genderModel"
import genderAttributes from '../model/genderModel'

export const genderRepository = {

// create
createGender : async(payload:genderAttributes)=>{
const newGender = GenderType.create(payload)
return newGender;
}, 
// get
getGender : async(payload: genderAttributes)=>{
return await GenderType.findAll()
}, 
// update
updateGender : async(id:number, payload: genderAttributes)=>{
const [affectedRows] = await GenderType.update(payload, {
    where: {id},
    returning: true,
});
 if (affectedRows === 0) {
      throw new Error("Gender not found");
    }
       // Optionally fetch updated row
    const updatedGenderType = await GenderType.findByPk(id);
    return updatedGenderType;
},
// delete
deleteGender : async(id:number)=>{
const deletedRows = await GenderType.destroy({
        where: { id },
    });
     if (deletedRows === 0) {
        throw new Error("Gender not found");
    }
    return deletedRows;
  },
}


