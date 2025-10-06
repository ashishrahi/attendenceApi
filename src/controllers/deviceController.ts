import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';


// GET all machines/devices
export const getMachines = async (req: Request, res: Response) => {
  try {
    const payload = req.body
    const{success, message, data} = await deviceService.deviceData()
   res.status(StatusCodes.OK).json({success, message, data})

  } catch (error: any) {
    console.error('Error in getMachines:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
