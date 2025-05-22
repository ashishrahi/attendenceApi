const { getConnection, sql } = require('../config/database');
const bcryptjs= require('bcryptjs');

const login = async (req, res) => {
  const { loginName, password } = req.body;

  if (!loginName || !password) {
    return res.status(400).json({ success: false, message: 'Missing login credentials' });
  }

  try {
    const pool = await getConnection();

    // Step 1: Fetch user login record
    const userResult = await pool.request()
      .input('LOGIN_NAME', sql.VarChar, loginName)
      .query('SELECT * FROM USER_LOGIN WHERE LOGIN_NAME = @LOGIN_NAME');

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid login credentials' });
    }

    const userLogin = userResult.recordset[0];

    // Step 2: Validate password
    const isMatch = await bcryptjs.compare(password, userLogin.PASSWORD);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const userId = userLogin.USER_ID;

    // Step 3: Fetch full user profile from USER table
    const userProfileResult = await pool.request()
      .input('USER_ID', sql.Int, userId)
      .query('SELECT * FROM [USER] WHERE USER_ID = @USER_ID');

    const userProfile = userProfileResult.recordset[0];

    // Step 4: Fetch roles and role-permissions
    const rolesAndPermissionsResult = await pool.request()
      .input('USER_ID', sql.Int, userId)
      .query(`
        SELECT 
          rm.RoleID, rm.RoleName, m.MenuId, m.MenuName, m.ParentId, m.PageUrl, m.Icon,
          rp.IsAdd, rp.IsEdit, rp.IsDel, rp.IsView, rp.IsPrint, rp.IsExport, rp.IsRelease, rp.IsPost
        FROM USER_ROLE ur
        JOIN RoleMaster rm ON ur.ROLE_ID = rm.RoleID
        JOIN RolePermission rp ON rm.RoleID = rp.RoleId
        JOIN Menu m ON rp.MenuId = m.MenuId
        WHERE ur.USER_ID = @USER_ID
      `);

    const roles = [];
    const permissions = [];

    rolesAndPermissionsResult.recordset.forEach(row => {
      if (!roles.some(role => role.roleId === row.RoleID)) {
        roles.push({ roleId: row.RoleID, roleName: row.RoleName });
      }

      permissions.push({
        menuId: row.MenuId,
        menuName: row.MenuName,
        parentId: row.ParentId,
        pageUrl: row.PageUrl,
        icon: row.Icon,
        isAdd: row.IsAdd,
        isEdit: row.IsEdit,
        isDel: row.IsDel,
        isView: row.IsView,
        isPrint: row.IsPrint,
        isExport: row.IsExport,
        isRelease: row.IsRelease,
        isPost: row.IsPost
      });
    });

    // Step 5: Fetch user-specific permissions (UserPermission table)
    const userMenuResult = await pool.request()
      .input('UserId', sql.Int, userId)
      .query(`
        SELECT MenuId, ParentId, IsAdd, IsEdit, IsDel, IsView, IsPrint, IsExport, IsRelease, IsPost
        FROM UserPermission
        WHERE UserId = @UserId
      `);

    const userMenus = userMenuResult.recordset.map(row => ({
      menuId: row.MenuId,
      parentId: row.ParentId,
      isAdd: row.IsAdd,
      isEdit: row.IsEdit,
      isDel: row.IsDel,
      isView: row.IsView,
      isPrint: row.IsPrint,
      isExport: row.IsExport,
      isRelease: row.IsRelease,
      isPost: row.IsPost
    }));

    // Step 6: Respond with full login + profile + permissions
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        ...userProfile,
        loginName: userLogin.LOGIN_NAME,
        isSystem: userLogin.IS_SYSTEM,
        orgId: userLogin.ORG_ID,
        roles,
        permissions,
        menus: userMenus
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};






module.exports = { login };
