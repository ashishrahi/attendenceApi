const { getConnection, sql } = require('../config/database');


const createBeat = async (req, res) => {
    try {
      const { name, code, area_id} = req.body;
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('code', sql.NVarChar, code)
        .input('area_id', sql.Int, area_id)
        .query(`
          INSERT INTO d06_beat (Name, Code, Area_Id)
          VALUES (@name, @code, @area_id);
        `);
  
      res.json({
        success: true,
        message: "Added successfully"
      });
    } catch (error) {
      console.error('Error in createBeat:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  const updateBeat = async (req, res) => {
    try {
      const { id, name, code, area_id } = req.body;
  
      const pool = await getConnection();
  
      await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('code', sql.NVarChar, code)
        .input('area_id', sql.Int, area_id)
        .query(`
          UPDATE d06_beat
          SET Name = @name,
              Code = @code,
              Area_Id = @area_id
          WHERE Id = @id;
        `);
  
      res.json({
        success: true,
        message: 'Updated successfully'
      });
    } catch (error) {
      console.error('Error in updateBeat:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  

const getBeat = async (req, res) => {
    try {
        // console.log(req.user.personData);
        // const UserRole = req.user.personData.RoleName;
        const pool = await getConnection();
        const result = await pool.request()
            .query("SELECT DISTINCT * FROM [iDMS].[dbo].[d06_beat]")
        console.log(result);
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

const deleteBeat = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID' });
      }
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM d06_beat WHERE Id = @id;`);
  
      if (result.rowsAffected[0] > 0) {
        res.json({
          success: true,
          message: 'Deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Beat not found'
        });
      }
    } catch (error) {
      console.error('Error in deleteBeat:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  

module.exports = {
    createBeat,
    getBeat,
    deleteBeat,
    updateBeat
};