import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authenticationService } from '../services/index';



export const loginController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
  const{success, message, data} = await authenticationService.loginService()
  res.status(StatusCodes.OK).json({success, message, data})

      
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const {success, message, data} = await authenticationService.changePasswordService();
    res.status(StatusCodes.OK).json({success, message, data})
   
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const{success, message, data} = await authenticationService.resetPasswordService()
    res.status(StatusCodes.OK).json({success, message, data})
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


