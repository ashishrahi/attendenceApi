const { getConnection, sql } = require('../config/database');


const createArea = async (req, res) => {
    try {
      const { name, code, ward_id} = req.body;
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('code', sql.NVarChar, code)
        .input('ward_id', sql.Int, ward_id)
        .query(`
          INSERT INTO d05_area (Name, Code, Ward_Id)
          VALUES (@name, @code, @ward_id);
          
          SELECT 1 AS IsSuccess, 'Added successfully' AS Message;
        `);
  
      const { IsSuccess, Message } = result.recordset[0];
  
      res.json({
        success: IsSuccess,
        message: Message
      });
    } catch (error) {
      console.error('Error in createWard:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  const updateArea = async (req, res) => {
    try {
      const { id, name, code, ward_id } = req.body;
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('code', sql.NVarChar, code)
        .input('ward_id', sql.Int, ward_id)
        .query(`
          UPDATE d05_area
          SET Name = @name,
              Code = @code,
              Ward_Id = @ward_id
          WHERE Id = @id;
          
          SELECT 1 AS IsSuccess, 'Updated successfully' AS Message;
        `);
  
      const { IsSuccess, Message } = result.recordset[0];
  
      res.json({
        success: IsSuccess,
        message: Message
      });
    } catch (error) {
      console.error('Error in updateArea:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  

const getArea = async (req, res) => {
    try {
        // console.log(req.user.personData);
        // const UserRole = req.user.personData.RoleName;
        const pool = await getConnection();
        const result = await pool.request()
            .query("SELECT DISTINCT * FROM d05_area")
        console.log(result);
        // const { IsSuccess, Message } = result.recordsets[0][0];
        const area = result.recordset;

        res.json({
            success: true,
            message: "Message",
            data: area
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const deleteArea = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID' });
      }
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM d05_area WHERE Id = @id;`);
  
      if (result.rowsAffected[0] > 0) {
        res.json({
          success: true,
          message: 'Deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Area not found'
        });
      }
    } catch (error) {
      console.error('Error in deleteArea:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  

module.exports = {
    getArea,
    createArea,
    deleteArea,
    updateArea
};