import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';



export const login = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
  const{success, message, data} = await authenticationService.login(payload)
  res.status(StatusCodes.OK).json({success, message, data})

      
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const {success, message, data} = await authenticationService.changePassword(payload);
    res.status(StatusCodes.OK).json({success, message, data})
   
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const{success, message, data} = await authenticationService.resetPassword(payload)
    res.status(StatusCodes.OK).json({success, message, data})
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


