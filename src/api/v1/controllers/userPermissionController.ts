// controllers/UserPermissionController.ts
import { Request, Response } from 'express';
import { getConnection, sql } from '../config/database';
import { Permission } from '../../types/permissionTypes';



export const createUserPermission = async (req: Request<{}, {}, { permissions: Permission[] }>, res: Response) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({ success: false, message: "Permissions array is required." });
    }

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const UserId = permissions[0].UserId;

    // 🔒 Check admin role
    const roleResult = await pool.request()
      .input('UserId', sql.Int, Number(UserId))
      .query(`
        SELECT rm.RoleName
        FROM USER_ROLE ur
        JOIN RoleMaster rm ON ur.ROLE_ID = rm.RoleID
        WHERE ur.USER_ID = @UserId
      `);

    const userRole = roleResult.recordset[0]?.RoleName?.toLowerCase();
    if (userRole === 'admin') {
      return res.status(400).json({
        success: false,
        message: "Permissions for admin role are assigned automatically. Manual assignment is not allowed."
      });
    }

    for (const perm of permissions) {
      await transaction.request()
        .input('UserId', sql.NVarChar(450), perm.UserId.toString())
        .input('MenuId', sql.Int, perm.MenuId)
        .input('ParentId', sql.Int, perm.ParentId ?? 0)
        .input('IsAdd', sql.Bit, perm.IsAdd ?? false)
        .input('IsEdit', sql.Bit, perm.IsEdit ?? false)
        .input('IsDel', sql.Bit, perm.IsDel ?? false)
        .input('IsView', sql.Bit, perm.IsView ?? false)
        .input('IsPrint', sql.Bit, perm.IsPrint ?? false)
        .input('IsExport', sql.Bit, perm.IsExport ?? false)
        .input('IsRelease', sql.Bit, perm.IsRelease ?? false)
        .input('IsPost', sql.Bit, perm.IsPost ?? false)
        .query(`
          INSERT INTO UserPermission (
            UserId, MenuId, ParentId, IsAdd, IsEdit, IsDel, IsView,
            IsPrint, IsExport, IsRelease, IsPost
          )
          VALUES (
            @UserId, @MenuId, @ParentId, @IsAdd, @IsEdit, @IsDel, @IsView,
            @IsPrint, @IsExport, @IsRelease, @IsPost
          );
        `);
    }

    await transaction.commit();
    res.json({ success: true, message: 'Permissions added successfully' });
  } catch (error: any) {
    console.error('Error in createUserPermission:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateUserPermission = async (req: Request<{ id: string }, {}, Permission[]>, res: Response) => {
  const UserId = req.params.id;
  const permissions = req.body;

  if (!Array.isArray(permissions) || !UserId) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    // 🔒 Check admin role
    const roleResult = await pool.request()
      .input('UserId', sql.Int, Number(UserId))
      .query(`
        SELECT rm.RoleName
        FROM USER_ROLE ur
        JOIN RoleMaster rm ON ur.ROLE_ID = rm.RoleID
        WHERE ur.USER_ID = @UserId
      `);

    const userRole = roleResult.recordset[0]?.RoleName?.toLowerCase();
    if (userRole === 'admin') {
      return res.status(400).json({
        success: false,
        message: "Admin user's permissions cannot be manually updated. They have all permissions by default."
      });
    }

    for (const item of permissions) {
      await transaction.request()
        .input('UserId', sql.NVarChar(450), UserId)
        .input('MenuId', sql.Int, item.MenuId)
        .input('ParentId', sql.Int, item.ParentId ?? 0)
        .input('IsAdd', sql.Bit, item.IsAdd ?? false)
        .input('IsEdit', sql.Bit, item.IsEdit ?? false)
        .input('IsDel', sql.Bit, item.IsDel ?? false)
        .input('IsView', sql.Bit, item.IsView ?? false)
        .input('IsPrint', sql.Bit, item.IsPrint ?? false)
        .input('IsExport', sql.Bit, item.IsExport ?? false)
        .input('IsRelease', sql.Bit, item.IsRelease ?? false)
        .input('IsPost', sql.Bit, item.IsPost ?? false)
        .query(`
          IF EXISTS (
            SELECT 1 FROM UserPermission WHERE UserId = @UserId AND MenuId = @MenuId
          )
          BEGIN
            UPDATE UserPermission
            SET ParentId = @ParentId,
                IsAdd = @IsAdd,
                IsEdit = @IsEdit,
                IsDel = @IsDel,
                IsView = @IsView,
                IsPrint = @IsPrint,
                IsExport = @IsExport,
                IsRelease = @IsRelease,
                IsPost = @IsPost
            WHERE UserId = @UserId AND MenuId = @MenuId;
          END
          ELSE
          BEGIN
            INSERT INTO UserPermission
            (UserId, MenuId, ParentId, IsAdd, IsEdit, IsDel, IsView, IsPrint, IsExport, IsRelease, IsPost)
            VALUES
            (@UserId, @MenuId, @ParentId, @IsAdd, @IsEdit, @IsDel, @IsView, @IsPrint, @IsExport, @IsRelease, @IsPost);
          END
        `);
    }

    await transaction.commit();
    res.status(200).json({ success: true, message: "Permissions updated successfully" });
  } catch (error: any) {
    console.error("Error updating permissions:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getUserPermissions = async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'User ID (id) is required' });
  }

  try {
    const pool = await getConnection();

    const roleResult = await pool.request()
      .input('UserId', sql.Int, Number(id))
      .query(`
        SELECT rm.RoleName
        FROM USER_ROLE ur
        JOIN RoleMaster rm ON ur.ROLE_ID = rm.RoleID
        WHERE ur.USER_ID = @UserId
      `);

    const userRole = roleResult.recordset[0]?.RoleName?.toLowerCase();
    const isAdmin = userRole === 'admin';

    let query = `
      SELECT 
        up.*, 
        rm.RoleID,
        rm.RoleName,
        (u.FIRST_NAME + ' ' + ISNULL(u.MIDDLE_NAME, '') + ' ' + u.SUR_NAME) AS FullName
      FROM UserPermission up
      LEFT JOIN [user] u ON up.UserId = u.USER_ID
      LEFT JOIN USER_ROLE ur ON up.UserId = ur.USER_ID
      LEFT JOIN RoleMaster rm ON CAST(ur.ROLE_ID AS INT) = rm.RoleID
      WHERE up.UserId = @UserId
    `;

    const result = await pool.request()
      .input('UserId', sql.Int, Number(id))
      .query(query);

    res.json({
      success: true,
      message: 'Fetched user permissions successfully',
      isAdmin,
      data: result.recordset
    });

  } catch (error: any) {
    console.error('Error in getUserPermissions:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteUserPermission = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.params.id;

    if (!userId.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid UserId' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('UserId', sql.NVarChar(450), userId)
      .query('DELETE FROM UserPermission WHERE UserId = @UserId;');

    if (result.rowsAffected[0] > 0) {
      res.json({ success: true, message: `Deleted permissions for UserId: ${userId}` });
    } else {
      res.status(404).json({ success: false, message: 'No permissions found for this UserId' });
    }

  } catch (error: any) {
    console.error('Error deleting user permissions:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
