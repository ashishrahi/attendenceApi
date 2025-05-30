const { getConnection, sql } = require('../config/database');
const bcryptjs = require('bcryptjs'); // For hashing password

// const createUser = async (req, res) => {
//   const {
//     roleId,
//     surName,
//     firstName,
//     middleName,
//     shortName,
//     userCode,
//     dob,
//     doa,
//     doj,
//     genderId,
//     curPhone,
//     curMobile,
//     email,
//     isActive,
//     isDeleted,
//     userTypeId,
//     otp,
//     loginName,
//     password,
//     isSystem,
//     orgId
//   } = req.body;

//   if (!loginName || !password || !roleId) {
//     return res.status(400).json({
//       success: false,
//       message: 'Missing required fields'
//     });
//   }

//   let transaction;
//   try {
//     const pool = await getConnection();
//     transaction = new sql.Transaction(pool);
//     await transaction.begin();

//     const userRequest = new sql.Request(transaction);

//     const userResult = await userRequest
//       .input('ROLE_ID', sql.NVarChar, roleId)
//       .input('SUR_NAME', sql.VarChar, surName)
//       .input('FIRST_NAME', sql.VarChar, firstName)
//       .input('MIDDLE_NAME', sql.VarChar, middleName)
//       .input('SHORT_NAME', sql.VarChar, shortName)
//       .input('USER_CODE', sql.VarChar, userCode)
//       .input('DOB', sql.SmallDateTime, dob)
//       .input('DOA', sql.SmallDateTime, doa)
//       .input('DOJ', sql.SmallDateTime, doj)
//       .input('GENDER_ID', sql.SmallInt, genderId)
//       .input('CUR_PHONE', sql.VarChar, curPhone)
//       .input('CUR_MOBILE', sql.VarChar, curMobile)
//       .input('EMAIL', sql.VarChar, email)
//       .input('IS_ACTIVE', sql.Bit, isActive)
//       .input('IS_DELETED', sql.Bit, isDeleted)
//       .input('USER_TYPE_ID', sql.SmallInt, userTypeId)
//       .input('OTP', sql.VarChar, otp || '')
//       .query(`
//         INSERT INTO [USER] (
//           RANK_ID, SUR_NAME, FIRST_NAME, MIDDLE_NAME, SHORT_NAME,
//           USER_CODE, DOB, DOA, DOJ, GENDER_ID,
//           CUR_PHONE, CUR_MOBILE, EMAIL, IS_ACTIVE,
//           IS_DELETED, USER_TYPE_ID, OTP
//         )
//         OUTPUT INSERTED.USER_ID
//         VALUES (
//           @ROLE_ID, @SUR_NAME, @FIRST_NAME, @MIDDLE_NAME, @SHORT_NAME,
//           @USER_CODE, @DOB, @DOA, @DOJ, @GENDER_ID,
//           @CUR_PHONE, @CUR_MOBILE, @EMAIL, @IS_ACTIVE,
//           @IS_DELETED, @USER_TYPE_ID, @OTP
//         )
//       `);

//     const userId = userResult.recordset[0].USER_ID;

//     const hashedPassword = await bcryptjs.hash(password, 10);

//     const loginRequest = new sql.Request(transaction);
//     await loginRequest
//       .input('USER_ID', sql.Int, userId)
//       .input('LOGIN_NAME', sql.VarChar, loginName)
//       .input('PASSWORD', sql.NVarChar, hashedPassword)
//       .input('IS_SYSTEM', sql.Bit, isSystem)
//       .input('ORG_ID', sql.NVarChar, orgId)
//       .query(`
//         INSERT INTO USER_LOGIN (USER_ID, LOGIN_NAME, PASSWORD, IS_SYSTEM, ORG_ID)
//         VALUES (@USER_ID, @LOGIN_NAME, @PASSWORD, @IS_SYSTEM, @ORG_ID)
//       `);

//     await transaction.commit();

//     res.status(201).json({ success: true, message: 'User created successfully', userId });

//   } catch (error) {
//     if (transaction) await transaction.rollback();
//     console.error('User creation error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

const createUser = async (req, res) => {
  const {
    loginName,
    password,
    roleId,         // 🟢 Used as RANK_ID also
    permissions,
    surName,
    firstName,
    middleName,
    shortName,
    userCode,
    dob,
    doa,
    doj,
    genderId,
    curPhone,
    curMobile,
    email,
    isActive,
    isDeleted,
    userTypeId,
    otp,
    isSystem,
    orgId,
    employeeId,
    EmployeeUserId // ✅ New field added
  } = req.body;

  if (!loginName || !password || !roleId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  let transaction;
  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const userRequest = new sql.Request(transaction);
    const userResult = await userRequest
      .input('RANK_ID', sql.NVarChar(100), roleId.toString())  // 👈 Used roleId here
      .input('SUR_NAME', sql.VarChar(128), surName)
      .input('FIRST_NAME', sql.VarChar(128), firstName)
      .input('MIDDLE_NAME', sql.VarChar(128), middleName)
      .input('SHORT_NAME', sql.VarChar(50), shortName)
      .input('USER_CODE', sql.VarChar(50), userCode)
      .input('DOB', sql.SmallDateTime, dob)
      .input('DOA', sql.SmallDateTime, doa)
      .input('DOJ', sql.SmallDateTime, doj)
      .input('GENDER_ID', sql.SmallInt, genderId)
      .input('CUR_PHONE', sql.VarChar(20), curPhone)
      .input('CUR_MOBILE', sql.VarChar(20), curMobile)
      .input('EMAIL', sql.VarChar(50), email)
      .input('IS_ACTIVE', sql.Bit, isActive)
      .input('IS_DELETED', sql.Bit, isDeleted)
      .input('USER_TYPE_ID', sql.SmallInt, userTypeId)
      .input('OTP', sql.VarChar(128), otp)
      .input('EmployeeId', sql.Int, employeeId)
      .input('EmployeeUserId', sql.Int, EmployeeUserId) // ✅ New input
      .query(`
        INSERT INTO [USER] (
          RANK_ID, SUR_NAME, FIRST_NAME, MIDDLE_NAME, SHORT_NAME, USER_CODE,
          DOB, DOA, DOJ, GENDER_ID, CUR_PHONE, CUR_MOBILE, EMAIL,
          IS_ACTIVE, IS_DELETED, USER_TYPE_ID, OTP, EmployeeId, EmployeeUserId
        )
        OUTPUT inserted.USER_ID
        VALUES (
          @RANK_ID, @SUR_NAME, @FIRST_NAME, @MIDDLE_NAME, @SHORT_NAME, @USER_CODE,
          @DOB, @DOA, @DOJ, @GENDER_ID, @CUR_PHONE, @CUR_MOBILE, @EMAIL,
          @IS_ACTIVE, @IS_DELETED, @USER_TYPE_ID, @OTP, @EmployeeId, @EmployeeUserId
        )
      `);

    const userId = userResult.recordset[0].USER_ID;

    // USER_LOGIN
    const hashedPassword = await bcryptjs.hash(password, 10);
    await transaction.request()
      .input('USER_ID', sql.Int, userId)
      .input('LOGIN_NAME', sql.VarChar, loginName)
      .input('PASSWORD', sql.NVarChar, hashedPassword)
      .input('IS_SYSTEM', sql.Bit, isSystem)
      .input('ORG_ID', sql.NVarChar, orgId)
      .query(`
        INSERT INTO USER_LOGIN (USER_ID, LOGIN_NAME, PASSWORD, IS_SYSTEM, ORG_ID)
        VALUES (@USER_ID, @LOGIN_NAME, @PASSWORD, @IS_SYSTEM, @ORG_ID)
      `);

    // USER_ROLE
    await transaction.request()
      .input('USER_ID', sql.NVarChar(50), userId.toString())
      .input('ROLE_ID', sql.NVarChar(50), roleId.toString())
      .query(`
        INSERT INTO USER_ROLE (USER_ID, ROLE_ID)
        VALUES (@USER_ID, @ROLE_ID)
      `);

    // Permissions
    const parsedRoleId = Number(roleId);

    if (parsedRoleId === 2 || parsedRoleId === 6) {
      const modules = await pool.request().query(`SELECT Id FROM MenuMaster`);
      for (const module of modules.recordset) {
        await transaction.request()
          .input('UserId', sql.NVarChar(450), userId.toString())
          .input('MenuId', sql.Int, module.Id)
          .input('ParentId', sql.Int, null)
          .input('IsAdd', sql.Bit, true)
          .input('IsEdit', sql.Bit, true)
          .input('IsDel', sql.Bit, true)
          .input('IsView', sql.Bit, true)
          .input('IsPrint', sql.Bit, true)
          .input('IsExport', sql.Bit, true)
          .input('IsRelease', sql.Bit, true)
          .input('IsPost', sql.Bit, true)
          .query(`
            INSERT INTO UserPermission (
              UserId, MenuId, ParentId, IsAdd, IsEdit, IsDel, IsView,
              IsPrint, IsExport, IsRelease, IsPost
            )
            VALUES (
              @UserId, @MenuId, @ParentId, @IsAdd, @IsEdit, @IsDel, @IsView,
              @IsPrint, @IsExport, @IsRelease, @IsPost
            )
          `);
      }
    } else if (Array.isArray(permissions)) {
      for (const perm of permissions) {
        const {
          MenuId, ParentId,
          IsAdd, IsEdit, IsDel, IsView,
          IsPrint, IsExport, IsRelease, IsPost
        } = perm;

        await transaction.request()
          .input('UserId', sql.NVarChar(450), userId.toString())
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
            )
          `);
      }
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('User creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// const updateUser = async (req, res) => {
//   const { id } = req.params;
//   const {
//     roleId, surName, firstName, middleName, shortName,
//     userCode, dob, doa, doj, genderId, curPhone, curMobile,
//     email, isActive, isDeleted, userTypeId, otp,
//     loginName, password, isSystem, orgId
//   } = req.body;

//   let transaction;
//   try {
//     const pool = await getConnection();
//     transaction = new sql.Transaction(pool);
//     await transaction.begin();

//     const request = new sql.Request(transaction);

//     // Check if user exists
//     await request.input('USER_ID', sql.Int, id);  // Declare USER_ID here
//     const userCheck = await request.query(`
//       SELECT 1 FROM [USER] WHERE USER_ID = @USER_ID
//     `);
//     if (userCheck.recordset.length === 0) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // Update user details
//     await request
//       .input('ROLE_ID', sql.NVarChar, roleId)
//       .input('SUR_NAME', sql.VarChar, surName)
//       .input('FIRST_NAME', sql.VarChar, firstName)
//       .input('MIDDLE_NAME', sql.VarChar, middleName)
//       .input('SHORT_NAME', sql.VarChar, shortName)
//       .input('USER_CODE', sql.VarChar, userCode)
//       .input('DOB', sql.SmallDateTime, dob)
//       .input('DOA', sql.SmallDateTime, doa)
//       .input('DOJ', sql.SmallDateTime, doj)
//       .input('GENDER_ID', sql.SmallInt, genderId)
//       .input('CUR_PHONE', sql.VarChar, curPhone)
//       .input('CUR_MOBILE', sql.VarChar, curMobile)
//       .input('EMAIL', sql.VarChar, email)
//       .input('IS_ACTIVE', sql.Bit, isActive)
//       .input('IS_DELETED', sql.Bit, isDeleted)
//       .input('USER_TYPE_ID', sql.SmallInt, userTypeId)
//       .input('OTP', sql.VarChar, otp || '')
//       .query(`
//         UPDATE [USER]
//         SET RANK_ID = @ROLE_ID, SUR_NAME = @SUR_NAME, FIRST_NAME = @FIRST_NAME,
//             MIDDLE_NAME = @MIDDLE_NAME, SHORT_NAME = @SHORT_NAME, USER_CODE = @USER_CODE,
//             DOB = @DOB, DOA = @DOA, DOJ = @DOJ, GENDER_ID = @GENDER_ID,
//             CUR_PHONE = @CUR_PHONE, CUR_MOBILE = @CUR_MOBILE, EMAIL = @EMAIL,
//             IS_ACTIVE = @IS_ACTIVE, IS_DELETED = @IS_DELETED, USER_TYPE_ID = @USER_TYPE_ID,
//             OTP = @OTP
//         WHERE USER_ID = @USER_ID
//       `);

//     // Check if user was updated
//     const updateResult = await request.query(`
//       SELECT 1 FROM [USER] WHERE USER_ID = @USER_ID
//     `);
//     if (updateResult.recordset.length === 0) {
//       return res.status(404).json({ success: false, message: 'User not updated' });
//     }

//     // Update user login details
//     const loginRequest = new sql.Request(transaction)
//       .input('USER_ID', sql.Int, id) // Declare USER_ID here too
//       .input('LOGIN_NAME', sql.VarChar, loginName)
//       .input('IS_SYSTEM', sql.Bit, isSystem)
//       .input('ORG_ID', sql.NVarChar, orgId);

//     // Password update
//     if (password) {
//       const hashedPassword = await bcryptjs.hash(password, 10);
//       loginRequest.input('PASSWORD', sql.NVarChar, hashedPassword);
//       await loginRequest.query(`
//         UPDATE USER_LOGIN
//         SET LOGIN_NAME = @LOGIN_NAME, PASSWORD = @PASSWORD,
//             IS_SYSTEM = @IS_SYSTEM, ORG_ID = @ORG_ID
//         WHERE USER_ID = @USER_ID
//       `);
//     } else {
//       await loginRequest.query(`
//         UPDATE USER_LOGIN
//         SET LOGIN_NAME = @LOGIN_NAME,
//             IS_SYSTEM = @IS_SYSTEM, ORG_ID = @ORG_ID
//         WHERE USER_ID = @USER_ID
//       `);
//     }

//     await transaction.commit();
//     res.status(200).json({ success: true, message: 'User updated successfully' });

//   } catch (error) {
//     if (transaction) await transaction.rollback();
//     console.error('Update user error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    roleId, surName, firstName, middleName, shortName,
    userCode, dob, doa, doj, genderId, curPhone, curMobile,
    email, isActive, isDeleted, userTypeId, otp,
    employeeId, EmployeeUserId,
    loginName, password, isSystem, orgId,
    permissions
  } = req.body;

  let transaction;
  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);

    // Check if user exists
    await request.input('USER_ID', sql.Int, id);
    const userCheck = await request.query(`SELECT 1 FROM [USER] WHERE USER_ID = @USER_ID`);
    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update USER table
    await request
      .input('ROLE_ID', sql.NVarChar, roleId)
      .input('SUR_NAME', sql.VarChar, surName)
      .input('FIRST_NAME', sql.VarChar, firstName)
      .input('MIDDLE_NAME', sql.VarChar, middleName)
      .input('SHORT_NAME', sql.VarChar, shortName)
      .input('USER_CODE', sql.VarChar, userCode)
      .input('DOB', sql.SmallDateTime, dob)
      .input('DOA', sql.SmallDateTime, doa)
      .input('DOJ', sql.SmallDateTime, doj)
      .input('GENDER_ID', sql.SmallInt, genderId)
      .input('CUR_PHONE', sql.VarChar, curPhone)
      .input('CUR_MOBILE', sql.VarChar, curMobile)
      .input('EMAIL', sql.VarChar, email)
      .input('IS_ACTIVE', sql.Bit, isActive)
      .input('IS_DELETED', sql.Bit, isDeleted)
      .input('USER_TYPE_ID', sql.SmallInt, userTypeId)
      .input('OTP', sql.VarChar, otp || '')
      .input('EMPLOYEE_ID', sql.Int, employeeId)
      .input('EMPLOYEE_USER_ID', sql.Int, EmployeeUserId)
      .query(`
        UPDATE [USER]
        SET RANK_ID = @ROLE_ID,
            SUR_NAME = @SUR_NAME,
            FIRST_NAME = @FIRST_NAME,
            MIDDLE_NAME = @MIDDLE_NAME,
            SHORT_NAME = @SHORT_NAME,
            USER_CODE = @USER_CODE,
            DOB = @DOB,
            DOA = @DOA,
            DOJ = @DOJ,
            GENDER_ID = @GENDER_ID,
            CUR_PHONE = @CUR_PHONE,
            CUR_MOBILE = @CUR_MOBILE,
            EMAIL = @EMAIL,
            IS_ACTIVE = @IS_ACTIVE,
            IS_DELETED = @IS_DELETED,
            USER_TYPE_ID = @USER_TYPE_ID,
            OTP = @OTP,
            EmployeeId = @EMPLOYEE_ID,
            EmployeeUserId = @EMPLOYEE_USER_ID
        WHERE USER_ID = @USER_ID
      `);

    // Update USER_LOGIN
    const loginRequest = new sql.Request(transaction)
      .input('USER_ID', sql.Int, id)
      .input('LOGIN_NAME', sql.VarChar, loginName)
      .input('IS_SYSTEM', sql.Bit, isSystem)
      .input('ORG_ID', sql.NVarChar, orgId);

    if (password) {
      const hashedPassword = await bcryptjs.hash(password, 10);
      loginRequest.input('PASSWORD', sql.NVarChar, hashedPassword);
      await loginRequest.query(`
        UPDATE USER_LOGIN
        SET LOGIN_NAME = @LOGIN_NAME,
            PASSWORD = @PASSWORD,
            IS_SYSTEM = @IS_SYSTEM,
            ORG_ID = @ORG_ID
        WHERE USER_ID = @USER_ID
      `);
    } else {
      await loginRequest.query(`
        UPDATE USER_LOGIN
        SET LOGIN_NAME = @LOGIN_NAME,
            IS_SYSTEM = @IS_SYSTEM,
            ORG_ID = @ORG_ID
        WHERE USER_ID = @USER_ID
      `);
    }

    // Update USER_ROLE
    await transaction.request()
      .input('USER_ID', sql.NVarChar(50), id.toString())
      .query(`DELETE FROM USER_ROLE WHERE USER_ID = @USER_ID`);

    await transaction.request()
      .input('USER_ID', sql.NVarChar(50), id.toString())
      .input('ROLE_ID', sql.NVarChar(50), roleId.toString())
      .query(`
        INSERT INTO USER_ROLE (USER_ID, ROLE_ID)
        VALUES (@USER_ID, @ROLE_ID)
      `);

    // Delete old permissions
    await transaction.request()
      .input('UserId', sql.NVarChar(450), id.toString())
      .query(`DELETE FROM UserPermission WHERE UserId = @UserId`);

    // Add new permissions
    const parsedRoleId = Number(roleId);
    if (parsedRoleId === 2 || parsedRoleId === 6) {
      const modules = await pool.request().query(`SELECT MenuId FROM Menu`);
      for (const module of modules.recordset) {
        await transaction.request()
          .input('UserId', sql.NVarChar(450), id.toString())
          .input('MenuId', sql.Int, module.MenuId)
          .input('ParentId', sql.Int, null)
          .input('IsAdd', sql.Bit, true)
          .input('IsEdit', sql.Bit, true)
          .input('IsDel', sql.Bit, true)
          .input('IsView', sql.Bit, true)
          .input('IsPrint', sql.Bit, true)
          .input('IsExport', sql.Bit, true)
          .input('IsRelease', sql.Bit, true)
          .input('IsPost', sql.Bit, true)
          .query(`
            INSERT INTO UserPermission (
              UserId, MenuId, ParentId, IsAdd, IsEdit, IsDel, IsView,
              IsPrint, IsExport, IsRelease, IsPost
            )
            VALUES (
              @UserId, @MenuId, @ParentId, @IsAdd, @IsEdit, @IsDel, @IsView,
              @IsPrint, @IsExport, @IsRelease, @IsPost
            )
          `);
      }
    } else if (Array.isArray(permissions)) {
      for (const perm of permissions) {
        const {
          MenuId, ParentId,
          IsAdd, IsEdit, IsDel, IsView,
          IsPrint, IsExport, IsRelease, IsPost
        } = perm;

        await transaction.request()
          .input('UserId', sql.NVarChar(450), id.toString())
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
            )
          `);
      }
    }

    await transaction.commit();
    res.status(200).json({ success: true, message: 'User updated successfully' });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};



const getUser = async (req, res) => {
  try {
    const pool = await getConnection();
    const request = pool.request();

    const { id } = req.params;

    let query = '';
    if (id === '-1') {
      // Fetch all users
      query = `
        SELECT u.*, ul.LOGIN_NAME, ul.IS_SYSTEM, ul.ORG_ID 
        FROM [USER] u
        LEFT JOIN USER_LOGIN ul ON u.USER_ID = ul.USER_ID
      `;
    } else {
      // Fetch user by id
      request.input('id', id);
      query = `
        SELECT u.*, ul.LOGIN_NAME, ul.IS_SYSTEM, ul.ORG_ID 
        FROM [USER] u
        LEFT JOIN USER_LOGIN ul ON u.USER_ID = ul.USER_ID
        WHERE u.USER_ID = @id
      `;
    }

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'No users found' });
    }

    res.status(200).json({ success: true, data: result.recordset });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnection();
    const request = pool.request();

    // First query to check if the user exists
    await request
      .input('USER_ID_CHECK', sql.Int, id)
      .query('SELECT * FROM [USER] WHERE USER_ID = @USER_ID_CHECK');

    const userCheck = await request.query('SELECT * FROM [USER] WHERE USER_ID = @USER_ID_CHECK');

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('User found, proceeding with update.');

    // Second query to perform the soft delete
    const result = await request
      .input('USER_ID_UPDATE', sql.Int, id)
      .query(`
        UPDATE [USER]
        SET IS_DELETED = 1
        WHERE USER_ID = @USER_ID_UPDATE
      `);

    console.log('Rows affected:', result.rowsAffected); // Logs how many rows were affected by the update.

    if (result.rowsAffected[0] === 0) {
      return res.status(500).json({ success: false, message: 'User update failed' });
    }

    res.status(200).json({ success: true, message: 'User deleted (soft delete)' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createUser,
  updateUser,
  getUser,
  deleteUser
};
