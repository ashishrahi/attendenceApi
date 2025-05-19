const { getConnection, sql } = require('../config/database');

const createRoleWithPermissions = async (req, res) => {
  const { roleName, createdDt, modifyDt, user_ID, rolePermission } = req.body;

  // Basic validation
  if (!roleName || !user_ID || !Array.isArray(rolePermission)) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields or invalid permissions format',
    });
  }

  let transaction;
  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // OPTIONAL: Reseed RoleID to start from 0 (next insert will be 1)
    // Uncomment only if safe and necessary
    // await new sql.Request(transaction).query(`DBCC CHECKIDENT ('RoleMaster', RESEED, 0);`);

    // Step 1: Insert into RoleMaster
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

    // Step 2: Insert RolePermission entries
    for (const perm of rolePermission) {
      if (!perm.menuId) continue; // Skip if essential data is missing

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

    res.json({
      success: true,
      message: 'Role created successfully',
      roleId: newRoleId,
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Create Role Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const updateRoleWithPermissions = async (req, res) => {
  const { roleId, roleName, modifyDt, user_ID, rolePermission } = req.body;

  // Validation
  if (!roleId || !roleName || !user_ID || !Array.isArray(rolePermission)) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields or invalid format',
    });
  }

  let transaction;
  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Step 1: Update RoleMaster
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

    // Step 2: Delete existing RolePermission entries
    const deleteRequest = new sql.Request(transaction);
    await deleteRequest
      .input('RoleId', sql.Int, roleId)
      .query(`DELETE FROM RolePermission WHERE RoleId = @RoleId`);

    // Step 3: Insert new RolePermission entries
    for (const perm of rolePermission) {
      if (!perm.menuId) continue; // Skip invalid entries

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

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Update Role Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const getRoleWithPermissions = async (req, res) => {
  const roleId = req.params.id ? parseInt(req.params.id) : null;

  try {
    const pool = await getConnection();

    if (roleId) {
      //Fetch one role with permissions
      const roleResult = await pool
        .request()
        .input('RoleID', sql.Int, roleId)
        .query('SELECT * FROM RoleMaster WHERE RoleID = @RoleID');

      if (roleResult.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Role not found' });
      }

      // Fetch permissions for the role
      const permissionsResult = await pool
        .request()
        .input('RoleID', sql.Int, roleId)
        .query('SELECT * FROM RolePermission WHERE RoleId = @RoleID');

      if (permissionsResult.recordset.length === 0) {
        console.log(`No permissions found for RoleID ${roleId}`);
      }

      return res.json({
        success: true,
        data: {
          ...roleResult.recordset[0],
          permissions: permissionsResult.recordset.length > 0 ? permissionsResult.recordset : null, // Handle null case
        },
      });

    } else {
      //Fetch all roles and attach permissions to each
      const roleResults = await pool.request().query('SELECT * FROM RoleMaster');
      const roles = roleResults.recordset;

      const enrichedRoles = [];

      for (const role of roles) {
        const permResult = await pool
          .request()
          .input('RoleID', sql.Int, role.RoleID)
          .query('SELECT * FROM RolePermission WHERE RoleId = @RoleID');

        enrichedRoles.push({
          ...role,
          permissions: null,
        });
      }

      return res.json({
        success: true,
        data: enrichedRoles
      });
    }
  } catch (error) {
    console.error('Get Role Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteRoleWithPermissions = async (req, res) => {
  const roleId = parseInt(req.params.id);

  if (!roleId || isNaN(roleId)) {
    return res.status(400).json({ success: false, message: 'Invalid RoleID' });
  }

  let transaction;
  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Step 1: Delete from RolePermission (child table)
    const deletePermissionsRequest = new sql.Request(transaction);
    await deletePermissionsRequest
      .input('RoleID', sql.Int, roleId)
      .query(`DELETE FROM RolePermission WHERE RoleId = @RoleID`);

    // Step 2: Delete from RoleMaster (parent table)
    const deleteRoleRequest = new sql.Request(transaction);
    const roleDeleteResult = await deleteRoleRequest
      .input('RoleID', sql.Int, roleId)
      .query(`DELETE FROM RoleMaster WHERE RoleID = @RoleID`);

    // Check if Role was actually deleted
    if (roleDeleteResult.rowsAffected[0] === 0) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Role not found or already deleted' });
    }

    await transaction.commit();

    res.json({ success: true, message: 'Role deleted successfully' });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Delete Role Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRoleWithPermissions,
  updateRoleWithPermissions,
  getRoleWithPermissions,
  deleteRoleWithPermissions
};