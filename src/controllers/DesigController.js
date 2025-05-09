const { getConnection, sql } = require('../config/database');


const createDesignation = async (req, res) => {
    try {
      const { name, code } = req.body;
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('code', sql.NVarChar, code)
        .query(`
          INSERT INTO d02_desig (Name, Code)
          VALUES (@name, @code);
          
          SELECT 1 AS IsSuccess, 'Added successfully' AS Message;
        `);
  
      const { IsSuccess, Message } = result.recordset[0];
  
      res.json({
        success: IsSuccess,
        message: Message
      });
    } catch (error) {
      console.error('Error in createDesignation:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  const updateDesignation = async (req, res) => {
    try {
      const { id, name, code } = req.body;
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('code', sql.NVarChar, code)
        .query(`
          UPDATE d02_desig
          SET Name = @name,
              Code = @code
          WHERE Id = @id;
          
          SELECT 1 AS IsSuccess, 'Updated successfully' AS Message;
        `);
  
      const { IsSuccess, Message } = result.recordset[0];
  
      res.json({
        success: IsSuccess,
        message: Message
      });
    } catch (error) {
      console.error('Error in updateDesignation:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  

const getDesignation = async (req, res) => {
    try {
        // console.log(req.user.personData);
        // const UserRole = req.user.personData.RoleName;
        const pool = await getConnection();
        const result = await pool.request()
            .query("SELECT DISTINCT * FROM [iDMS].[dbo].[d02_desig]");
        console.log(result);
        // const { IsSuccess, Message } = result.recordsets[0][0];
        const designation = result.recordset;

        res.json({
            success: true,
            message: "Message",
            data: designation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const deleteDesignation = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID' });
      }
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM d02_desig WHERE Id = @id;`);
  
      if (result.rowsAffected[0] > 0) {
        res.json({
          success: true,
          message: 'Deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Designation not found'
        });
      }
    } catch (error) {
      console.error('Error in deleteDesignation:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  

module.exports = {
    getDesignation,
    createDesignation,
    deleteDesignation,
    updateDesignation
};