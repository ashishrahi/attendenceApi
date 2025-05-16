const { getConnection, sql } = require('../config/database');



  
const getGender = async (req, res) => {
    try {
        // console.log(req.user.personData);
        // const UserRole = req.user.personData.RoleName;
        const pool = await getConnection();
        const result = await pool.request()
            .query(`SELECT [ID_NO]
      ,[LOCATION]
      ,[MAC_ADDRESS]
      ,[DeviceName]
      ,[UserCount]
      ,[UpdatedOn]
  FROM [iDMS].[dbo].[tblMachine]`)
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


module.exports = {
    getGender
};