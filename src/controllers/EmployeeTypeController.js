const { getConnection, sql } = require('../config/database');


const createEmployeeType = async (req, res) => {
  try {
    const { EmployeeTypeName, Description } = req.body;

    const pool = await getConnection();

    await pool.request()
      .input('EmployeeTypeName', sql.NVarChar, EmployeeTypeName)
      .input('Description', sql.NVarChar, Description)
      .query(`
        INSERT INTO EmployeeType (EmployeeTypeName, Description)
        VALUES (@EmployeeTypeName, @Description);
      `);

    res.json({
      success: true,
      message: "Employee type added successfully"
    });
  } catch (error) {
    console.error('Error in createEmployeeType:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

 const updateEmployeeType = async (req, res) => {
  try {
    const { EmployeeTypeId, EmployeeTypeName, Description, IsActive } = req.body;

    const pool = await getConnection();

    await pool.request()
      .input('EmployeeTypeId', sql.Int, EmployeeTypeId)
      .input('EmployeeTypeName', sql.NVarChar, EmployeeTypeName)
      .input('Description', sql.NVarChar, Description)
      .input('IsActive', sql.Bit, IsActive)
      .query(`
        UPDATE EmployeeType
        SET EmployeeTypeName = @EmployeeTypeName,
            Description = @Description,
            IsActive = @IsActive,
            UpdatedAt = GETDATE()
        WHERE EmployeeTypeId = @EmployeeTypeId;
      `);

    res.json({
      success: true,
      message: 'Employee type updated successfully'
    });
  } catch (error) {
    console.error('Error in updateEmployeeType:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getEmployeeTypes = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query("SELECT * FROM EmployeeType");

    res.json({
      success: true,
      message: "Fetched employee types",
      data: result.recordset
    });
  } catch (error) {
    console.error('Error in getEmployeeTypes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteEmployeeType = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM EmployeeType WHERE EmployeeTypeId = @id;`);

    if (result.rowsAffected[0] > 0) {
      res.json({
        success: true,
        message: 'Employee type deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Employee type not found'
      });
    }
  } catch (error) {
    console.error('Error in deleteEmployeeType:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


module.exports = {
    createEmployeeType,
    updateEmployeeType,
    getEmployeeTypes,
    deleteEmployeeType
};