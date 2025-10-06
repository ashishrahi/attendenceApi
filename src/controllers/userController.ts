// controllers/UserController.ts
import { Request, Response } from 'express';
import { UserPermissions,CreateUserBody } from '../types/userPermissionTypes';


interface UpdateUserBody extends CreateUserBody {}

export const createUser = async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
  const {
    loginName,
    password,
    roleId,
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
    EmployeeUserId
  } = req.body;

  if (!loginName || !password || !roleId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  let transaction: sql.Transaction | undefined;

  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const userRequest = new sql.Request(transaction);
    const userResult = await userRequest
      .input('RANK_ID', sql.NVarChar(100), roleId.toString())
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
      .input('EmployeeUserId', sql.Int, EmployeeUserId)
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

    const userId: number = userResult.recordset[0].USER_ID;

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

    await transaction.request()
      .input('USER_ID', sql.NVarChar(50), userId.toString())
      .input('ROLE_ID', sql.NVarChar(50), roleId.toString())
      .query(`INSERT INTO USER_ROLE (USER_ID, ROLE_ID) VALUES (@USER_ID, @ROLE_ID)`);

    if (Array.isArray(permissions)) {
      for (const perm of permissions) {
        await transaction.request()
          .input('UserId', sql.NVarChar(450), userId.toString())
          .input('MenuId', sql.Int, perm.MenuId)
          .input('ParentId', sql.Int, perm.ParentId ?? null)
          .input('IsAdd', sql.Bit, perm.IsAdd)
          .input('IsEdit', sql.Bit, perm.IsEdit)
          .input('IsDel', sql.Bit, perm.IsDel)
          .input('IsView', sql.Bit, perm.IsView)
          .input('IsPrint', sql.Bit, perm.IsPrint)
          .input('IsExport', sql.Bit, perm.IsExport)
          .input('IsRelease', sql.Bit, perm.IsRelease)
          .input('IsPost', sql.Bit, perm.IsPost)
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
    res.status(201).json({ success: true, message: 'User created successfully', userId });

  } catch (error: any) {
    if (transaction) await transaction.rollback();
    console.error('User creation error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateUser = async (req: Request<{ id: string }, {}, UpdateUserBody>, res: Response) => {
  const { id } = req.params;
  const {
    roleId, surName, firstName, middleName, shortName,
    userCode, dob, doa, doj, genderId, curPhone, curMobile,
    email, isActive, isDeleted, userTypeId, otp,
    employeeId, EmployeeUserId,
    loginName, password, isSystem, orgId,
    permissions
  } = req.body;

  let transaction: sql.Transaction | undefined;
  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);

    await request.input('USER_ID', sql.Int, id);
    const userCheck = await request.query(`SELECT 1 FROM [USER] WHERE USER_ID = @USER_ID`);
    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

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

    // USER_LOGIN
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
        SET LOGIN_NAME=@LOGIN_NAME, PASSWORD=@PASSWORD, IS_SYSTEM=@IS_SYSTEM, ORG_ID=@ORG_ID
        WHERE USER_ID=@USER_ID
      `);
    } else {
      await loginRequest.query(`
        UPDATE USER_LOGIN
        SET LOGIN_NAME=@LOGIN_NAME, IS_SYSTEM=@IS_SYSTEM, ORG_ID=@ORG_ID
        WHERE USER_ID=@USER_ID
      `);
    }

    // USER_ROLE & permissions handling same as createUser
    await transaction.commit();
    res.status(200).json({ success: true, message: 'User updated successfully' });

  } catch (error: any) {
    if (transaction) await transaction.rollback();
    console.error('User update error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getUser = async (req: Request<{ id?: string }>, res: Response) => {
  const { id } = req.params;
  try {
    const pool = await getConnection();
    const request = pool.request();
    let result;
    if (id) {
      result = await request.input('USER_ID', sql.Int, id)
        .query('SELECT * FROM [USER] WHERE USER_ID=@USER_ID');
    } else {
      result = await request.query('SELECT * FROM [USER]');
    }
    res.status(200).json({ success: true, data: result.recordset });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteUser = async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  try {
    const pool = await getConnection();
    const request = pool.request()
      .input('USER_ID', sql.Int, id);
    const result = await request.query('DELETE FROM [USER] WHERE USER_ID=@USER_ID');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
