const { getConnection, sql } = require('../config/database');


const getDepartment = async (req, res) => {
    try {
        // console.log(req.user.personData);
        // const UserRole = req.user.personData.RoleName;
        const pool = await getConnection();
        const result = await pool.request()
            .query("SELECT DISTINCT * FROM [iDMS].[dbo].[tblDepartment];")
        console.log(result);
        // const { IsSuccess, Message } = result.recordsets[0][0];
        const department = result.recordset;

        res.json({
            success: true,
            message: "Message",
            data: department
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
    getDepartment,
};