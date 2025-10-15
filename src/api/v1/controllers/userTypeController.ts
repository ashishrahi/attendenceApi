import { Request, Response } from "express";
import { getConnection, sql } from "../config/database";
import { UserTypeRequestBody } from "../../types/userTypes";


// Create User Type
export const createUserType = async (req: Request<{}, {}, UserTypeRequestBody>, res: Response) => {
  try {
    const { name, code } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('name', sql.NVarChar(50), name)
      .input('code', sql.Char(5), code)
      .query(`
        INSERT INTO USER_TYPE (USER_TYPE_NAME, USER_TYPE_CODE)
        VALUES (@name, @code);
        
        SELECT 1 AS IsSuccess, 'Added successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];
    res.json({ success: IsSuccess, message: Message });

  } catch (error: any) {
    console.error('Error in createUserType:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update User Type
export const updateUserType = async (req: Request<{}, {}, UserTypeRequestBody>, res: Response) => {
  try {
    const { id, name, code } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "User type ID is required" });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.SmallInt, id)
      .input('name', sql.NVarChar(50), name)
      .input('code', sql.Char(5), code)
      .query(`
        UPDATE USER_TYPE
        SET USER_TYPE_NAME = @name,
            USER_TYPE_CODE = @code
        WHERE USER_TYPE_ID = @id;

        SELECT 1 AS IsSuccess, 'Updated successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];
    res.json({ success: IsSuccess, message: Message });

  } catch (error: any) {
    console.error('Error in updateUserType:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all User Types
export const getUserTypes = async (_req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM USER_TYPE");

    res.json({
      success: true,
      message: "Fetched user types successfully",
      data: result.recordset
    });

  } catch (error: any) {
    console.error('Error in getUserTypes:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete User Type
export const deleteUserType = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const typeId = parseInt(id);

    if (isNaN(typeId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.SmallInt, typeId)
      .query("DELETE FROM USER_TYPE WHERE USER_TYPE_ID = @id");

    if (result.rowsAffected[0] > 0) {
      res.json({ success: true, message: 'Deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'User type not found' });
    }

  } catch (error: any) {
    console.error('Error in deleteUserType:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
