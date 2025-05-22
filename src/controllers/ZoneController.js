const { getConnection, sql } = require('../config/database');

//  creation of zones
const createZone = async (req, res) => {
    try {
      const { name, code } = req.body;
  
      const pool = await getConnection();
  
      const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('code', sql.NVarChar, code)
        .query(`
          INSERT INTO d03_zone (Name, Code)
          VALUES (@name, @code);
          
          SELECT 1 AS IsSuccess, 'Added successfully' AS Message;
        `);
  
      const { IsSuccess, Message } = result.recordset[0];
  
      res.json({
        success: IsSuccess,
        message: Message
      });
    } catch (error) {
      console.error('Error in createZone:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
//  update of all zones
  const updateZone = async (req, res) => {
  try {
    const { id, name, code } = req.body;

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('code', sql.NVarChar, code)
      .query(`
        UPDATE d03_zone
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
    console.error('Error in updateZone:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

//  getting all zones
const getZone = async (req, res) => {
    try {
        // console.log(req.user.personData);
        // const UserRole = req.user.personData.RoleName;
        const pool = await getConnection();
        const result = await pool.request()
            .query("SELECT DISTINCT * FROM [iDMS].[dbo].[d03_zone]")
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

// delete zones
const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;

    // validate Id
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Zone is is wrong' });
    }

    // connect to database
    const pool = await getConnection();

    // checking for database id exist or not
    const zoneIdExist = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT COUNT(*) AS total FROM d04_ward WHERE zone_id = @id`);

      // if ward already exist
    if (zoneIdExist.recordset[0].total > 0) {
      return res.status(400).json({
        success: false,
        message: "The Zone cannot be deleted already use in ward"
      });
    }

    // Zone to be deleted,if zone is not in use
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM d03_zone WHERE Id = @id`);

    if (result.rowsAffected[0] > 0) {
      res.json({
        success: true,
        message: 'Zone has been successfully deleted'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Zone has not found'
      });
    }
  } catch (error) {
    console.error('Error in deleteZone:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

  

module.exports = {
    getZone,
    createZone,
    deleteZone,
    updateZone
};