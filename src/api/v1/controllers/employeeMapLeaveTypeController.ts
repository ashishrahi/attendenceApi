import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {leaveMappingService} from '../services/leaveMappingService' 

// CREATE Leave Mappings
export const createLeaveMappings = async (req: Request, res: Response) => {
  try {
   const payload = req.body;
   const{success, message, data} = await leaveMappingService.createLeaveMappingService(payload);

    res.json({success, message, data});

  } catch (error: any) {
    console.error('Error in createLeaveMappings:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET all Leave Mappings by type
export const getAllLeaveMappings = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const{success, message, data} = await leaveMappingService.getLeaveMappingService(payload)
    res.status(StatusCodes.OK).json({success, message, data})
  } catch (error: any) {
    console.error('Error in getAllLeaveMappings:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET Mapped Leave Types for an employee
export const getMappedLeaveTypes = async (req: Request, res: Response) => {
  const employeeId = parseInt(req.params.id);

  if (!employeeId || isNaN(employeeId)) {
    return res.status(400).json({ success: false, message: 'Valid employeeId आवश्यक है' });
  }

  try {
    const pool = await getConnection();

    const empTypeResult = await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .query(`SELECT EmployeeTypeId FROM d00_emptable WHERE id = @EMP_ID`);

    if (empTypeResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee नहीं मिला' });
    }

    const employeeTypeId = empTypeResult.recordset[0].EmployeeTypeId;

    const directMapResult = await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .query(`SELECT LeaveTypeId FROM LeaveMappingEmployee WHERE EmployeeId = @EMP_ID`);

    let leaveTypeIds = directMapResult.recordset.length > 0
      ? directMapResult.recordset.map(r => r.LeaveTypeId)
      : (await pool.request()
          .input('EMP_TYPE_ID', sql.Int, employeeTypeId)
          .query(`SELECT LeaveTypeId FROM LeaveMappingEmployeeType WHERE EmployeeTypeId = @EMP_TYPE_ID`))
          .recordset.map(r => r.LeaveTypeId);

    if (leaveTypeIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const result = await pool.request().query(`
      SELECT DISTINCT LT.LeaveTypeID, LT.LeaveTypeName, LT.Description, LT.MaxDaysAllowed
      FROM LeaveType LT
      WHERE LT.LeaveTypeID IN (${leaveTypeIds.join(',')})
      AND LT.IsActive = 1
    `);

    return res.status(200).json({ success: true, data: result.recordset });

  } catch (error: any) {
    console.error('Error in getMappedLeaveTypes:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE all leave mappings
export const deleteAllLeaveMappings = async (_req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    await pool.request().query(`DELETE FROM LeaveMapping`);

    res.json({ success: true, message: "All leave mappings deleted successfully" });

  } catch (error: any) {
    console.error('Error in deleteAllLeaveMappings:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
