import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { handleUnknownError } from '../../../utilities/helper/handleUnknownError';
import { designationService } from '../services';
import DesignationAttributes from '../../../model/designationModel'



// CREATE Designation
export const createDesignation = async (req: Request<{}, {}, DesignationAttributes>, res: Response) => {
  try {
    const payload = req.body;
  
    const {success, message, data} = await designationService.createDesignationService(payload)
    res.status(StatusCodes.CREATED).json({success, message, data})

  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message:handleUnknownError(error) });
  }
};

// READ Designations
export const getDesignation = async (req: Request, res: Response) => {
  try {
   const payload = req.body;
   const {success, message, data} = await designationService.getDesignationService(payload);
   res.status(StatusCodes.CREATED).json({success, message, data})

  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: handleUnknownError(error) });
  }
};

// UPDATE Designation
export const updateDesignation = async (req: Request<{id:string}, {}, DesignationAttributes>, res: Response) => {
  try {
     const id = Number(req.params.id)
     const payload = req.body
     const{success, message, data } = await designationService.updateDesignationService(id, payload);
     res.status(StatusCodes.OK).json({success, message, data})

  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: handleUnknownError(error) });
  }
};

// DELETE Designation
export const deleteDesignation = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = Number(req.params.id);
  const {success, message, data} = await designationService.deleteDesinationService(id)
  res.status(StatusCodes.CREATED).json({success, message, data})
   

  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: handleUnknownError(error) });
  }
};
