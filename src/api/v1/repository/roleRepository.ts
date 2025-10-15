import Role,{ RoleCreationAttributes }  from "../../../model/roleModel";

export const roleRepository ={
    async create(payload: RoleCreationAttributes){
        return await Role.create(payload)
    },
     async findAll() {
        return await Role.findAll({ order: [["createdAt", "DESC"]] });
      },
    
      async findById(id: number) {
        return await Role.findByPk(id);
      },
    
      async update(id: number, payload: RoleCreationAttributes) {
        const record = await Role.findByPk(id);
        if (!record) throw new Error("Role not found");
    
        await record.update(payload);
        return record;
      },
    
      async delete(id: number) {
        const record = await Role.findByPk(id);
        if (!record) throw new Error("Role not found");
    
        await record.destroy();
        return { id };
      },
}