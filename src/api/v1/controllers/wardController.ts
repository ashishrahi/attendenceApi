// controllers/WardController.ts
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { wardService } from "../services/index";

export const createWardController = async (req:Request, res: Response) => {
  try {
    const payload = req.body;
    const { success, message, data } = await wardService.createWardService(
      payload
    );
    res.status(StatusCodes.OK).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in createWard:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateWardController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body;
    const { success, message, data } = await wardService.updateWardService(
      id,
      payload
    );

    res.status(StatusCodes.OK).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in updateWard:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getWardController = async (req: Request, res: Response) => {
  try {
    const{success, message, data} = await  wardService.getWardService()

   res.status(StatusCodes.OK).json({ success, message, data});
  } catch (error: any) {
    console.error("Error in getWard:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteWardController = async (
  req: Request,
  res: Response
) => {
  try {
    const  id  = Number(req.params.id);
     const{success, message} = await wardService.deleteWardService(id)
      res.status(StatusCodes.OK).json({ success , message});
    
  } catch (error: any) {
    console.error("Error in deleteWard:", error);
    res.status(StatusCodes.OK).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
