const { getConnection, sql } = require('../config/database');


const createWard = async (req, res) => {
    try {
      const { name, code, zone_id} = req.body;
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('code', sql.NVarChar, code)
        .input('zone_id', sql.Int, zone_id)
        .query(`
          INSERT INTO d04_ward (Name, Code, Zone_Id)
          VALUES (@name, @code, @zone_id);
          
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
  
  const updateWard = async (req, res) => {
    try {
      const { id, name, code, zone_id } = req.body;
  
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
    } catch (error) {
      console.error('Error in updateWard:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  

const getWard = async (req, res) => {
    try {
        // console.log(req.user.personData);
        // const UserRole = req.user.personData.RoleName;
        const pool = await getConnection();
        const result = await pool.request()
            .query("SELECT DISTINCT * FROM [iDMS].[dbo].[d04_ward]")
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

const deleteWard = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID' });
      }
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM d04_ward WHERE Id = @id;`);
  
      if (result.rowsAffected[0] > 0) {
        res.json({
          success: true,
          message: 'Deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }
    } catch (error) {
      console.error('Error in deleteWard:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  

module.exports = {
    getWard,
    createWard,
    deleteWard,
    updateWard
};