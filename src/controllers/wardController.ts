// controllers/WardController.ts
import { Request, Response } from 'express';
import { Ward } from '../types/wardTypes';
import { StatusCodes } from 'http-status-codes';

export const createWard = async (req: Request<{}, {}, Ward>, res: Response) => {
  try {
    const payload = req.body;
    const {success,message, data} = await waredService.createWard(payload);
    res.status(StatusCodes.CREATED).json({success, message,data})

    // const pool = await getConnection();

    // const result = await pool.request()
    //   .input('name', sql.NVarChar, name)
    //   .input('code', sql.NVarChar, code)
    //   .input('zone_id', sql.Int, zone_id)
    //   .query(`
    //     INSERT INTO d04_ward (Name, Code, Zone_Id)
    //     VALUES (@name, @code, @zone_id);
    //     SELECT 1 AS IsSuccess, 'Added successfully' AS Message;
    //   `);

    // const { IsSuccess, Message } = result.recordset[0];

    
  } catch (error: any) {
    console.error('Error in createWard:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const updateWard = async (req: Request<{}, {}, Ward>, res: Response) => {
  try {
    const { id, name, code, zone_id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Ward ID is required' });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('code', sql.NVarChar, code)
      .input('zone_id', sql.Int, zone_id)
      .query(`
        UPDATE d04_ward
        SET Name = @name,
            Code = @code,
            Zone_Id = @zone_id
        WHERE Id = @id;
        SELECT 1 AS IsSuccess, 'Updated successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];

    res.json({
      success: IsSuccess,
      message: Message
    });
  } catch (error: any) {
    console.error('Error in updateWard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getWard = async (_req: Request, res: Response) => {
  try {
    const pool = await getConnection();

    const result = await pool.request()
      .query("SELECT DISTINCT * FROM [iDMS].[dbo].[d04_ward]");

    const ward = result.recordset;

    res.json({
      success: true,
      message: 'Fetched wards successfully',
      data: ward
    });
  } catch (error: any) {
    console.error('Error in getWard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const deleteWard = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const pool = await getConnection();

    // Check if ward exists in area
    const existWardId = await pool.request()
      .input('id', sql.Int, Number(id))
      .query(`SELECT COUNT(*) AS total FROM dbo.d05_area WHERE ward_id = @id`);

    if (existWardId.recordset[0].total > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ward already exists in area'
      });
    }

    // Delete ward
    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query(`DELETE FROM d04_ward WHERE Id = @id;`);

    if (result.rowsAffected[0] > 0) {
      res.json({ success: true, message: 'Deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Ward not found' });
    }
  } catch (error: any) {
    console.error('Error in deleteWard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
