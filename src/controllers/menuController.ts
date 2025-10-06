import { Request, Response } from 'express';
import { getConnection, sql } from '../config/database';

// Create Menu
export const createMenu = async (req: Request, res: Response) => {
  try {
    const {
      MenuName, ParentId, PageUrl, Icon, DisplayNo,
      IsMenu, IsAdd, IsEdit, IsDel, IsView, IsPrint,
      IsExport, IsRelease, IsPost
    } = req.body;

    const pool = await getConnection();

    const result = await pool.request()
      .input('MenuName', sql.NVarChar(50), MenuName)
      .input('ParentId', sql.Int, ParentId)
      .input('PageUrl', sql.VarChar(100), PageUrl)
      .input('Icon', sql.VarChar(50), Icon)
      .input('DisplayNo', sql.Int, DisplayNo)
      .input('IsMenu', sql.Bit, IsMenu)
      .input('IsAdd', sql.Bit, IsAdd)
      .input('IsEdit', sql.Bit, IsEdit)
      .input('IsDel', sql.Bit, IsDel)
      .input('IsView', sql.Bit, IsView)
      .input('IsPrint', sql.Bit, IsPrint)
      .input('IsExport', sql.Bit, IsExport)
      .input('IsRelease', sql.Bit, IsRelease)
      .input('IsPost', sql.Bit, IsPost)
      .query(`
        INSERT INTO Menu (
          MenuName, ParentId, PageUrl, Icon, DisplayNo,
          IsMenu, IsAdd, IsEdit, IsDel, IsView,
          IsPrint, IsExport, IsRelease, IsPost
        ) VALUES (
          @MenuName, @ParentId, @PageUrl, @Icon, @DisplayNo,
          @IsMenu, @IsAdd, @IsEdit, @IsDel, @IsView,
          @IsPrint, @IsExport, @IsRelease, @IsPost
        );

        SELECT 1 AS IsSuccess, 'Menu added successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];

    res.json({ success: IsSuccess, message: Message });
  } catch (error: any) {
    console.error('Error in createMenu:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update Menu
export const updateMenu = async (req: Request, res: Response) => {
  try {
    const {
      MenuId, MenuName, ParentId, PageUrl, Icon, DisplayNo,
      IsMenu, IsAdd, IsEdit, IsDel, IsView, IsPrint,
      IsExport, IsRelease, IsPost
    } = req.body;

    const pool = await getConnection();

    const result = await pool.request()
      .input('MenuId', sql.Int, MenuId)
      .input('MenuName', sql.NVarChar(50), MenuName)
      .input('ParentId', sql.Int, ParentId)
      .input('PageUrl', sql.VarChar(100), PageUrl)
      .input('Icon', sql.VarChar(50), Icon)
      .input('DisplayNo', sql.Int, DisplayNo)
      .input('IsMenu', sql.Bit, IsMenu)
      .input('IsAdd', sql.Bit, IsAdd)
      .input('IsEdit', sql.Bit, IsEdit)
      .input('IsDel', sql.Bit, IsDel)
      .input('IsView', sql.Bit, IsView)
      .input('IsPrint', sql.Bit, IsPrint)
      .input('IsExport', sql.Bit, IsExport)
      .input('IsRelease', sql.Bit, IsRelease)
      .input('IsPost', sql.Bit, IsPost)
      .query(`
        UPDATE Menu SET
          MenuName = @MenuName,
          ParentId = @ParentId,
          PageUrl = @PageUrl,
          Icon = @Icon,
          DisplayNo = @DisplayNo,
          IsMenu = @IsMenu,
          IsAdd = @IsAdd,
          IsEdit = @IsEdit,
          IsDel = @IsDel,
          IsView = @IsView,
          IsPrint = @IsPrint,
          IsExport = @IsExport,
          IsRelease = @IsRelease,
          IsPost = @IsPost
        WHERE MenuId = @MenuId;

        SELECT 1 AS IsSuccess, 'Menu updated successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];

    res.json({ success: IsSuccess, message: Message });
  } catch (error: any) {
    console.error('Error in updateMenu:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get All Menus
export const getMenus = async (req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Menu');

    res.json({
      success: true,
      message: 'Fetched menus successfully',
      data: result.recordset
    });
  } catch (error: any) {
    console.error('Error in getMenus:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Child Menus
export const getChildMenuMaster = async (req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`SELECT * FROM Menu WHERE ParentId != 0`);

    res.json({
      success: true,
      message: 'Fetched child menus successfully',
      data: result.recordset
    });
  } catch (error: any) {
    console.error('Error in getChildMenuMaster:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete Menu
export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query('DELETE FROM Menu WHERE MenuId = @id');

    if (result.rowsAffected[0] > 0) {
      res.json({ success: true, message: 'Menu deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Menu not found' });
    }
  } catch (error: any) {
    console.error('Error in deleteMenu:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
