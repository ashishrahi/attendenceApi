const { getConnection, sql } = require('../config/database');

// CREATE
const createBreak = async (req, res) => {
  try {
    const { IntervalMinutes, IntervalName, IsActive } = req.body;
    const pool = await getConnection();

    const result = await pool.request()
      .input('IntervalMinutes', sql.Int, IntervalMinutes)
      .input('IntervalName', sql.NVarChar, IntervalName)
      .input('IsActive', sql.Bit, IsActive)
      .query(`
        INSERT INTO BreakMaster (IntervalMinutes, IntervalName, IsActive)
        VALUES (@IntervalMinutes, @IntervalName, @IsActive);
        SELECT 1 AS IsSuccess, 'Break added successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];
    res.json({ success: IsSuccess, message: Message });
  } catch (error) {
    console.error('Error in createBreak:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// READ
const getBreaks = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`SELECT * FROM BreakMaster`);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// UPDATE
const updateBreak = async (req, res) => {
  try {
    const { id, IntervalMinutes, IntervalName, IsActive } = req.body;
    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('IntervalMinutes', sql.Int, IntervalMinutes)
      .input('IntervalName', sql.NVarChar, IntervalName)
      .input('IsActive', sql.Bit, IsActive)
      .query(`
        UPDATE BreakMaster
        SET IntervalMinutes = @IntervalMinutes,
            IntervalName = @IntervalName,
            IsActive = @IsActive
        WHERE id = @id;

        SELECT 1 AS IsSuccess, 'Break updated successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];
    res.json({ success: IsSuccess, message: Message });
  } catch (error) {
    console.error('Error in updateBreak:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE
const deleteBreak = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM BreakMaster WHERE id = @id`);

    if (result.rowsAffected[0] > 0) {
      res.json({ success: true, message: 'Break deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Break not found' });
    }
  } catch (error) {
    console.error('Error in deleteBreak:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBreak,
  getBreaks,
  updateBreak,
  deleteBreak
};