import { Request, Response } from "express";
import {AreaCreationAttributes} from "../model/areaModel";
import { StatusCodes } from "http-status-codes";
import { areaService } from "../services/index";

// create
export const createArea = async (req: Request, res: Response) => {
  try {
    const payload = req.body as AreaCreationAttributes;

    const { success, message, data } = await areaService.createAreaService(
      payload
    );

    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in createArea:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// get Area
export const getArea = async (req: Request, res: Response) => {
 try {
         const payload = req.body;
         const{success, message, data} = await areaService.getAreaService(payload)
         res.status(StatusCodes.OK).json({success, message, data})
 } catch (error) {
         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success: false, message: "interserver Error"})
 }
};

// update Area
export const updateArea = async (req: Request, res: Response) => {
  try {
     
     const id = Number(req.params.id)
     const payload = req.body;
     const{success, message, data} = await areaService.updateAreaService(id, payload)

    res.status(StatusCodes.OK).json({ success, message, data});
  } catch (error: any) {
    console.error("Error in updateArea:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// delete
export const deleteArea = async (req: Request, res: Response) => {
  try {
    const id  = Number(req.params.id);
    const{success, message, data} = await areaService.deleteAreaService(id)
    res.status(StatusCodes.OK).json({success, message, data})

    
  } catch (error: any) {
    console.error("Error in deleteArea:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
