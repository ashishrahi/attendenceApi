const { getConnection, sql } = require('../config/database');


const createHelpCreation = async (req, res) => {
    try {
      const { menuId, menuName, description } = req.body;
      console.log('req.body:',req.body)
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('menu_id', sql.NVarChar, menuId)
        .input('menu_name', sql.NVarChar, menuName)
        .input('description', sql.NVarChar, description)
        .query(`
          INSERT INTO HelpCreation (menu_id, menu_name, description)
          VALUES (@menu_id, @menu_name, @description);
          
          SELECT 1 AS IsSuccess, 'Added successfully' AS Message;
        `);
  
      const { IsSuccess, Message } = result.recordset[0];
  
      res.json({
        success: IsSuccess,
        message: Message
      });
    } catch (error) {
      console.error('Error in create HelpCreation:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

  const updateHelpCreation = async (req, res) => {
    try {
      const { menuId, menuName, description } = req.body;
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('menu_id', sql.Int, menuId)
        .input('menu_name', sql.NVarChar, menuName)
        .input('description', sql.NVarChar, description)
        .query(`
          UPDATE HelpCreation
          SET menu_name = @menu_name,
              description = @description
          WHERE menu_id = @menu_id;
          
          SELECT 1 AS IsSuccess, 'Updated successfully' AS Message;
        `);
  
      const { IsSuccess, Message } = result.recordset[0];
  
      res.json({
        success: IsSuccess,
        message: Message
      });
    } catch (error) {
      console.error('Error in update HelpCreation:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  
const getHelpCreation = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query("SELECT DISTINCT * FROM HelpCreation");

        const helpCreation = result.recordset;

        // Transform each row to the desired format
        const helpcreation = helpCreation.map(item => ({
            menuId: item.menu_id,
            menuName: item.menu_name,
            description: item.description
        }));

        res.json({
            success: true,
            message: "Fetched help creation data successfully",
            data: helpcreation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};



  

const deleteHelpCreation = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID' });
      }
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM d01_dept WHERE Id = @id;`);
  
      if (result.rowsAffected[0] > 0) {
        res.json({
          success: true,
          message: 'Deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }
    } catch (error) {
      console.error('Error in deleteDepartment:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  

module.exports = {
    getHelpCreation,
    createHelpCreation,
    deleteHelpCreation,
    updateHelpCreation
};