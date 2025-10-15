import { Request, Response } from "express";
import { getConnection, sql } from "../config/database";
import { RolePermission } from "../../types/rolePermissionTypes";



interface CreateRoleRequest extends Request {
  body: {
    roleName: string;
    createdDt?: string;
    modifyDt?: string;
    user_ID: string;
    rolePermission: RolePermission[];
  };
}

interface UpdateRoleRequest extends Request {
  body: {
    roleId: number;
    roleName: string;
    modifyDt?: string;
    user_ID: string;
    rolePermission: RolePermission[];
  };
}

export const createRoleWithPermissions = async (req: CreateRoleRequest, res: Response) => {
  const { roleName, createdDt, modifyDt, user_ID, rolePermission } = req.body;

  if (!roleName || !user_ID || !Array.isArray(rolePermission)) {
    return res.status(400).json({ success: false, message: 'Missing required fields or invalid permissions format' });
  }

  let transaction: sql.Transaction | undefined;

  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const roleRequest = new sql.Request(transaction);
    const roleResult = await roleRequest
      .input('RoleName', sql.NVarChar, roleName)
      .input('CreatedDt', sql.DateTime, createdDt ? new Date(createdDt) : new Date())
      .input('ModifyDt', sql.DateTime, modifyDt ? new Date(modifyDt) : new Date())
      .input('User_ID', sql.NVarChar, user_ID)
      .query(`
        INSERT INTO RoleMaster (RoleName, CreatedDt, ModifyDt, User_ID)
        OUTPUT INSERTED.RoleID
        VALUES (@RoleName, @CreatedDt, @ModifyDt, @User_ID);
      `);

    const newRoleId = roleResult.recordset[0].RoleID;

    for (const perm of rolePermission) {
      if (!perm.menuId) continue;

      const permRequest = new sql.Request(transaction);
      await permRequest
        .input('RoleId', sql.Int, newRoleId)
        .input('MenuId', sql.Int, perm.menuId)
        .input('ParentId', sql.Int, perm.parentId || 0)
        .input('IsAdd', sql.Bit, perm.isAdd || false)
        .input('IsEdit', sql.Bit, perm.isEdit || false)
        .input('IsDel', sql.Bit, perm.isDel || false)
        .input('IsView', sql.Bit, perm.isView || false)
        .input('IsPrint', sql.Bit, perm.isPrint || false)
        .input('IsExport', sql.Bit, perm.isExport || false)
        .input('IsRelease', sql.Bit, perm.isRelease || false)
        .input('IsPost', sql.Bit, perm.isPost || false)
        .query(`
          INSERT INTO RolePermission (
            RoleId, MenuId, ParentId,
            IsAdd, IsEdit, IsDel, IsView,
            IsPrint, IsExport, IsRelease, IsPost
          )
          VALUES (
            @RoleId, @MenuId, @ParentId,
            @IsAdd, @IsEdit, @IsDel, @IsView,
            @IsPrint, @IsExport, @IsRelease, @IsPost
          );
        `);
    }

    await transaction.commit();

    res.json({ success: true, message: 'Role created successfully', roleId: newRoleId });

  } catch (error: any) {
    if (transaction) await transaction.rollback();
    console.error('Create Role Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateRoleWithPermissions = async (req: UpdateRoleRequest, res: Response) => {
  const { roleId, roleName, modifyDt, user_ID, rolePermission } = req.body;

  if (!roleId || !roleName || !user_ID || !Array.isArray(rolePermission)) {
    return res.status(400).json({ success: false, message: 'Missing required fields or invalid format' });
  }

  let transaction: sql.Transaction | undefined;

  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const updateRequest = new sql.Request(transaction);
    await updateRequest
      .input('RoleID', sql.Int, roleId)
      .input('RoleName', sql.NVarChar, roleName)
      .input('ModifyDt', sql.DateTime, modifyDt ? new Date(modifyDt) : new Date())
      .input('User_ID', sql.NVarChar, user_ID)
      .query(`
        UPDATE RoleMaster
        SET RoleName = @RoleName,
            ModifyDt = @ModifyDt,
            User_ID = @User_ID
        WHERE RoleID = @RoleID;
      `);

    const deleteRequest = new sql.Request(transaction);
    await deleteRequest
      .input('RoleId', sql.Int, roleId)
      .query(`DELETE FROM RolePermission WHERE RoleId = @RoleId`);

    for (const perm of rolePermission) {
      if (!perm.menuId) continue;

      const insertRequest = new sql.Request(transaction);
      await insertRequest
        .input('RoleId', sql.Int, roleId)
        .input('MenuId', sql.Int, perm.menuId)
        .input('ParentId', sql.Int, perm.parentId || 0)
        .input('IsAdd', sql.Bit, perm.isAdd || false)
        .input('IsEdit', sql.Bit, perm.isEdit || false)
        .input('IsDel', sql.Bit, perm.isDel || false)
        .input('IsView', sql.Bit, perm.isView || false)
        .input('IsPrint', sql.Bit, perm.isPrint || false)
        .input('IsExport', sql.Bit, perm.isExport || false)
        .input('IsRelease', sql.Bit, perm.isRelease || false)
        .input('IsPost', sql.Bit, perm.isPost || false)
        .query(`
          INSERT INTO RolePermission (
            RoleId, MenuId, ParentId,
            IsAdd, IsEdit, IsDel, IsView,
            IsPrint, IsExport, IsRelease, IsPost
          )
          VALUES (
            @RoleId, @MenuId, @ParentId,
            @IsAdd, @IsEdit, @IsDel, @IsView,
            @IsPrint, @IsExport, @IsRelease, @IsPost
          );
        `);
    }

    await transaction.commit();
    res.json({ success: true, message: 'Role updated successfully' });

  } catch (error: any) {
    if (transaction) await transaction.rollback();
    console.error('Update Role Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getRoleWithPermissions = async (req: Request, res: Response) => {
  const roleId = req.params.id ? parseInt(req.params.id) : null;

  try {
    const pool = await getConnection();

    if (roleId) {
      const roleResult = await pool.request()
        .input('RoleID', sql.Int, roleId)
        .query('SELECT * FROM RoleMaster WHERE RoleID = @RoleID');

      if (roleResult.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Role not found' });
      }

      const permissionsResult = await pool.request()
        .input('RoleID', sql.Int, roleId)
        .query('SELECT * FROM RolePermission WHERE RoleId = @RoleID');

      return res.json({
        success: true,
        data: {
          ...roleResult.recordset[0],
          permissions: permissionsResult.recordset.length > 0 ? permissionsResult.recordset : null,
        },
      });

    } else {
      const roleResults = await pool.request().query('SELECT * FROM RoleMaster');
      const roles = roleResults.recordset;

      const enrichedRoles = [];
      for (const role of roles) {
        enrichedRoles.push({ ...role, permissions: null });
      }

      return res.json({ success: true, data: enrichedRoles });
    }
  } catch (error: any) {
    console.error('Get Role Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteRoleWithPermissions = async (req: Request, res: Response) => {
  const roleId = parseInt(req.params.id);

  if (!roleId || isNaN(roleId)) {
    return res.status(400).json({ success: false, message: 'Invalid RoleID' });
  }

  let transaction: sql.Transaction | undefined;

  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const deletePermissionsRequest = new sql.Request(transaction);
    await deletePermissionsRequest
      .input('RoleID', sql.Int, roleId)
      .query(`DELETE FROM RolePermission WHERE RoleId = @RoleID`);

    const deleteRoleRequest = new sql.Request(transaction);
    const roleDeleteResult = await deleteRoleRequest
      .input('RoleID', sql.Int, roleId)
      .query(`DELETE FROM RoleMaster WHERE RoleID = @RoleID`);

    if (roleDeleteResult.rowsAffected[0] === 0) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Role not found or already deleted' });
    }

    await transaction.commit();
    res.json({ success: true, message: 'Role deleted successfully' });

  } catch (error: any) {
    if (transaction) await transaction.rollback();
    console.error('Delete Role Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
