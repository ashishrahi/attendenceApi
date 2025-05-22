const { getConnection, sql } = require('../config/database');

const createLeaveCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;

        const pool = await getConnection();

        const result = await pool.request()
            .input('categoryName', sql.NVarChar, categoryName)
            .input('description', sql.NVarChar, description)
            .query(`
                INSERT INTO LeaveCategory (CategoryName, Description)
                VALUES (@categoryName, @description);
                
                SELECT 1 AS IsSuccess, 'Added successfully' AS Message;
            `);

        const { IsSuccess, Message } = result.recordset[0];

        res.json({
            success: IsSuccess,
            message: Message
        });
    } catch (error) {
        console.error('Error in createLeaveCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const updateLeaveCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;
        const { id } = req.params;  // Get the ID from the URL parameter

        // Check if ID is valid
        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const pool = await getConnection();

        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('categoryName', sql.NVarChar, categoryName)
            .input('description', sql.NVarChar, description)
            .query(`
                UPDATE LeaveCategory
                SET CategoryName = @categoryName,
                    Description = @description
                WHERE CategoryID = @id;
                
                SELECT 1 AS IsSuccess, 'Updated successfully' AS Message;
            `);

        const { IsSuccess, Message } = result.recordset[0];

        // Check if any row was affected
        if (result.rowsAffected[0] > 0) {
            res.json({
                success: IsSuccess,
                message: Message
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Leave category not found'
            });
        }
    } catch (error) {
        console.error('Error in updateLeaveCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const getLeaveCategory = async (req, res) => {
    try {
        const pool = await getConnection();

        const result = await pool.request()
            .query("SELECT * FROM LeaveCategory");

        const leaveCategories = result.recordset;

        res.json({
            success: true,
            message: "Leave categories retrieved successfully",
            data: leaveCategories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const deleteLeaveCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const pool = await getConnection();

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM LeaveCategory WHERE CategoryID = @id;`);

        if (result.rowsAffected[0] > 0) {
            res.json({
                success: true,
                message: 'Deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Leave category not found'
            });
        }
    } catch (error) {
        console.error('Error in deleteLeaveCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getLeaveCategory,
    createLeaveCategory,
    deleteLeaveCategory,
    updateLeaveCategory
};