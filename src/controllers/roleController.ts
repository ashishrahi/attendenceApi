import { Request, Response } from "express";
import { getConnection, sql } from "../config/database";

// Create Role
export const createRole = async (req: Request, res: Response) => {
  try {
    const { rolename }: { rolename: string } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('rolename', sql.NVarChar, rolename)
      .query(`
        INSERT INTO d07_rolemaster (RoleName)
        VALUES (@rolename);
        
        SELECT 1 AS IsSuccess, 'Added successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];

    res.json({ success: IsSuccess, message: Message });
  } catch (error: any) {
    console.error('Error in createRole:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update Role
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id, rolename }: { id: number, rolename: string } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('rolename', sql.NVarChar, rolename)
      .query(`
        UPDATE d07_rolemaster
        SET RoleName = @rolename
        WHERE Id = @id;

        SELECT 1 AS IsSuccess, 'Updated successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];
    res.json({ success: IsSuccess, message: Message });
  } catch (error: any) {
    console.error('Error in updateRole:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all Roles
export const getRole = async (req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT DISTINCT * FROM [iDMS].[dbo].[d07_rolemaster]");
    const roles = result.recordset;

    res.json({ success: true, message: 'Fetched roles successfully', data: roles });
  } catch (error: any) {
    console.error('Error in getRole:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete Role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query(`DELETE FROM d07_rolemaster WHERE Id = @id;`);

    if (result.rowsAffected[0] > 0) {
      res.json({ success: true, message: 'Deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Role not found' });
    }
  } catch (error: any) {
    console.error('Error in deleteRole:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
