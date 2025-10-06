import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { employeTypeService } from '../services';

// CREATE Employee Type
export const createEmployeeType = async (req: Request, res: Response) => {
  try {
     const payload = req.body;
     const {success, message, data} = await employeTypeService.createEmployeeTypeService(payload)

    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    console.error('Error in createEmployeeType:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error', error: error.message });
  }
};

// UPDATE Employee Type
export const updateEmployeeType = async (req: Request, res: Response) => {
  try {
   const payload = req.body;
   const id = Number(req.params.id)
   const{success, message, data} = await employeTypeService.updateEmployeeTypeService(id, payload)

    res.status(StatusCodes.OK).json({ success , message, data });
  } catch (error: any) {
    console.error('Error in updateEmployeeType:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET all Employee Types
export const getEmployeeTypes = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const{success, message, data} = await employeTypeService.getEmployeeTypeService(payload)
    res.status(StatusCodes.OK).json({success, message, data})

  } catch (error: any) {
    console.error('Error in getEmployeeTypes:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE Employee Type
export const deleteEmployeeType = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
   const{success, message, data} = await employeTypeService.deleteEmployeeTypeService(id)
   res.status(StatusCodes.OK).json({success, message, data})
   
  } catch (error: any) {
    console.error('Error in deleteEmployeeType:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
