import { Request, Response } from 'express';
import { getConnection, sql } from '../config/database';

// CREATE LEAVE TYPE
export const createLeaveType = async (req: Request, res: Response) => {
  const { leaveTypeName, maxDaysAllowed, description, isActive, categoryId } = req.body;

  if (!leaveTypeName || maxDaysAllowed === undefined || categoryId === undefined) {
    return res.status(400).json({
      success: false,
      message: 'leaveTypeName, maxDaysAllowed और categoryId आवश्यक हैं'
    });
  }

  try {
    const pool = await getConnection();
    await pool.request()
      .input('LEAVE_TYPE_NAME', sql.NVarChar, leaveTypeName)
      .input('MAX_DAYS_ALLOWED', sql.Int, maxDaysAllowed)
      .input('DESCRIPTION', sql.NVarChar, description || '')
      .input('IS_ACTIVE', sql.Bit, isActive)
      .input('CATEGORY_ID', sql.Int, categoryId)
      .query(`
        INSERT INTO LeaveType (LeaveTypeName, MaxDaysAllowed, Description, IsActive, CategoryId)
        VALUES (@LEAVE_TYPE_NAME, @MAX_DAYS_ALLOWED, @DESCRIPTION, @IS_ACTIVE, @CATEGORY_ID)
      `);

    res.status(201).json({ success: true, message: 'Leave Type created successfully' });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET ALL LEAVE TYPES
export const getLeaveTypes = async (req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM LeaveType');
    res.status(200).json({ success: true, data: result.recordset });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// UPDATE LEAVE TYPE
export const updateLeaveType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { leaveTypeName, maxDaysAllowed, description, isActive, categoryId } = req.body;

  if (!leaveTypeName || maxDaysAllowed === undefined || categoryId === undefined) {
    return res.status(400).json({
      success: false,
      message: 'leaveTypeName, maxDaysAllowed और categoryId आवश्यक हैं'
    });
  }

  try {
    const pool = await getConnection();
    await pool.request()
      .input('LEAVE_TYPE_ID', sql.Int, id)
      .input('LEAVE_TYPE_NAME', sql.NVarChar, leaveTypeName)
      .input('MAX_DAYS_ALLOWED', sql.Int, maxDaysAllowed)
      .input('DESCRIPTION', sql.NVarChar, description || '')
      .input('IS_ACTIVE', sql.Bit, isActive)
      .input('CATEGORY_ID', sql.Int, categoryId)
      .input('MODIFIED_AT', sql.DateTime, new Date())
      .query(`
        UPDATE LeaveType 
        SET 
          LeaveTypeName = @LEAVE_TYPE_NAME,
          MaxDaysAllowed = @MAX_DAYS_ALLOWED,
          Description = @DESCRIPTION,
          IsActive = @IS_ACTIVE,
          CategoryId = @CATEGORY_ID,
          ModifiedAt = @MODIFIED_AT
        WHERE LeaveTypeID = @LEAVE_TYPE_ID
      `);

    res.status(200).json({ success: true, message: 'Leave Type updated successfully' });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE LEAVE TYPE
export const deleteLeaveType = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const pool = await getConnection();
    await pool.request()
      .input('LEAVE_TYPE_ID', sql.Int, id)
      .query('DELETE FROM LeaveType WHERE LeaveTypeID = @LEAVE_TYPE_ID');

    res.status(200).json({ success: true, message: 'Leave Type deleted successfully' });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
