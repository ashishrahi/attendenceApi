import { Request, Response } from 'express';
import { getConnection, sql } from '../config/database';
import { LeaveCategoryInput } from '../types/leaveCategory';


// CREATE Leave Category
export const createLeaveCategory = async (req: Request, res: Response) => {
  try {
    const { categoryName, description }: LeaveCategoryInput = req.body;

    const pool = await getConnection();

    const result = await pool.request()
      .input('categoryName', sql.NVarChar, categoryName)
      .input('description', sql.NVarChar, description)
      .query(`
        INSERT INTO LeaveCategory (CategoryName, Description)
        VALUES (@categoryName, @description);
        
        SELECT 1 AS IsSuccess, 'Added successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];

    res.json({ success: IsSuccess, message: Message });

  } catch (error: any) {
    console.error('Error in createLeaveCategory:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// UPDATE Leave Category
export const updateLeaveCategory = async (req: Request, res: Response) => {
  try {
    const { categoryName, description }: LeaveCategoryInput = req.body;
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('categoryName', sql.NVarChar, categoryName)
      .input('description', sql.NVarChar, description)
      .query(`
        UPDATE LeaveCategory
        SET CategoryName = @categoryName,
            Description = @description
        WHERE CategoryID = @id;
        
        SELECT 1 AS IsSuccess, 'Updated successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];

    if (result.rowsAffected[0] > 0) {
      res.json({ success: IsSuccess, message: Message });
    } else {
      res.status(404).json({ success: false, message: 'Leave category not found' });
    }

  } catch (error: any) {
    console.error('Error in updateLeaveCategory:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET Leave Categories
export const getLeaveCategory = async (_req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM LeaveCategory');

    res.json({
      success: true,
      message: 'Leave categories retrieved successfully',
      data: result.recordset
    });

  } catch (error: any) {
    console.error('Error in getLeaveCategory:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE Leave Category
export const deleteLeaveCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM LeaveCategory WHERE CategoryID = @id;');

    if (result.rowsAffected[0] > 0) {
      res.json({ success: true, message: 'Deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Leave category not found' });
    }

  } catch (error: any) {
    console.error('Error in deleteLeaveCategory:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
