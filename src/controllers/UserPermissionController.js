const { getConnection, sql } = require('../config/database');

const createUserPermission = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({ success: false, message: "Permissions array is required." });
    }

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    // मान लेते हैं कि सभी permissions एक ही userId की हैं
    const UserId = permissions[0].UserId;

    // 🔒 Check if user has admin role
    const roleResult = await pool.request()
      .input('UserId', sql.Int, UserId)
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
      const {
        UserId, MenuId, ParentId,
        IsAdd, IsEdit, IsDel, IsView,
        IsPrint, IsExport, IsRelease, IsPost
      } = perm;

      await transaction.request()
        .input('UserId', sql.NVarChar(450), UserId)
        .input('MenuId', sql.Int, MenuId)
        .input('ParentId', sql.Int, ParentId)
        .input('IsAdd', sql.Bit, IsAdd)
        .input('IsEdit', sql.Bit, IsEdit)
        .input('IsDel', sql.Bit, IsDel)
        .input('IsView', sql.Bit, IsView)
        .input('IsPrint', sql.Bit, IsPrint)
        .input('IsExport', sql.Bit, IsExport)
        .input('IsRelease', sql.Bit, IsRelease)
        .input('IsPost', sql.Bit, IsPost)
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
  } catch (error) {
    console.error('Error in createUserPermission:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateUserPermission = async (req, res) => {
  const UserId = req.params.id;
  const permissions = req.body;

  if (!Array.isArray(permissions) || !UserId) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    // 🔒 Check if user has admin role
    const roleResult = await pool.request()
      .input('UserId', sql.Int, UserId)
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
      const {
        MenuId, ParentId = 0,
        IsAdd = false, IsEdit = false, IsDel = false, IsView = false,
        IsPrint = false, IsExport = false, IsRelease = false, IsPost = false
      } = item;

      await transaction.request()
        .input('UserId', sql.NVarChar(450), UserId)
        .input('MenuId', sql.Int, MenuId)
        .input('ParentId', sql.Int, ParentId)
        .input('IsAdd', sql.Bit, IsAdd)
        .input('IsEdit', sql.Bit, IsEdit)
        .input('IsDel', sql.Bit, IsDel)
        .input('IsView', sql.Bit, IsView)
        .input('IsPrint', sql.Bit, IsPrint)
        .input('IsExport', sql.Bit, IsExport)
        .input('IsRelease', sql.Bit, IsRelease)
        .input('IsPost', sql.Bit, IsPost)
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
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// const getUserPermissions = async (req, res) => {
//   const { id } = req.params;

//   if (id === undefined) {
//     return res.status(400).json({
//       success: false,
//       message: 'User ID (id) is required',
//     });
//   }

//   try {
//     const pool = await getConnection();
//     let query = `
//       SELECT 
//         up.*, 
//         (u.FIRST_NAME + ' ' + ISNULL(u.MIDDLE_NAME, '') + ' ' + u.SUR_NAME) AS FullName
//       FROM 
//         UserPermission up
//       LEFT JOIN 
//         [user] u ON up.UserId = u.USER_ID
//     `;

//     if (id !== '-1') {
//       query += ` WHERE up.UserId = @UserId`;
//     }

//     const request = pool.request();

//     if (id !== '-1') {
//       request.input('UserId', sql.Int, parseInt(id));
//     }

//     const result = await request.query(query);

//     res.json({
//       success: true,
//       message: 'Fetched user permissions successfully',
//       data: result.recordset
//     });
//   } catch (error) {
//     console.error('Error in getUserPermissions:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

const getUserPermissions = async (req, res) => {
  const { id } = req.params;

  if (id === undefined) {
    return res.status(400).json({
      success: false,
      message: 'User ID (id) is required',
    });
  }

  try {
    const pool = await getConnection();

    // पहले role निकाल लो
    const roleResult = await pool.request()
      .input('UserId', sql.Int, id)
      .query(`
        SELECT rm.RoleName
        FROM USER_ROLE ur
        JOIN RoleMaster rm ON ur.ROLE_ID = rm.RoleID
        WHERE ur.USER_ID = @UserId
      `);

    const userRole = roleResult.recordset[0]?.RoleName?.toLowerCase();
    const isAdmin = userRole === 'admin';

    // अब actual permission query करो
    let query = `
      SELECT 
        up.*, 
        rm.RoleID,
        rm.RoleName,
        (u.FIRST_NAME + ' ' + ISNULL(u.MIDDLE_NAME, '') + ' ' + u.SUR_NAME) AS FullName
      FROM 
        UserPermission up
      LEFT JOIN 
        [user] u ON up.UserId = u.USER_ID
      LEFT JOIN 
        USER_ROLE ur ON up.UserId = ur.USER_ID
      LEFT JOIN 
        RoleMaster rm ON CAST(ur.ROLE_ID AS INT) = rm.RoleID
    `;

    if (id !== '-1') {
      query += ` WHERE up.UserId = @UserId`;
    }

    const request = pool.request();
    if (id !== '-1') {
      request.input('UserId', sql.Int, parseInt(id));
    }

    const result = await request.query(query);

    res.json({
      success: true,
      message: 'Fetched user permissions successfully',
      isAdmin: isAdmin,
      data: result.recordset
    });

  } catch (error) {
    console.error('Error in getUserPermissions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteUserPermission = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId || userId.trim() === '') {
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
  } catch (error) {
    console.error('Error deleting user permissions:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


module.exports = {
  createUserPermission,
  updateUserPermission,
  getUserPermissions,
  deleteUserPermission
};
