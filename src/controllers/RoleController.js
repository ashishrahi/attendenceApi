const { getConnection, sql } = require('../config/database');


const createRole = async (req, res) => {
    try {
      const { rolename} = req.body;
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('rolename', sql.NVarChar, rolename)
        .query(`
          INSERT INTO d07_rolemaster (RoleName)
          VALUES (@rolename);
          
          SELECT 1 AS IsSuccess, 'Added successfully' AS Message;
        `);
  
      const { IsSuccess, Message } = result.recordset[0];
  
      res.json({
        success: IsSuccess,
        message: Message
      });
    } catch (error) {
      console.error('Error in createRole:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
 const updateRole = async (req, res) => {
  try {
    const { id, rolename } = req.body;

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

    res.json({
      success: IsSuccess,
      message: Message
    });
  } catch (error) {
    console.error('Error in updateRole:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

  

const getRole = async (req, res) => {
    try {
        // console.log(req.user.personData);
        // const UserRole = req.user.personData.RoleName;
        const pool = await getConnection();
        const result = await pool.request()
            .query("SELECT DISTINCT * FROM [iDMS].[dbo].[d07_rolemaster]")
        console.log(result);
        // const { IsSuccess, Message } = result.recordsets[0][0];
        const ward = result.recordset;

        res.json({
            success: true,
            message: "Message",
            data: ward
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const deleteRole = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID' });
      }
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM d07_rolemaster WHERE Id = @id;`);
  
      if (result.rowsAffected[0] > 0) {
        res.json({
          success: true,
          message: 'Deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
    } catch (error) {
      console.error('Error in deleteRole:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  

module.exports = {
    getRole,
    createRole,
    deleteRole,
    updateRole
};