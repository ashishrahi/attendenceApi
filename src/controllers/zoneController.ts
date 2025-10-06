// controllers/ZoneController.ts
import { Request, Response } from "express";
import { Zone } from "../types/zoneTypes";
import { StatusCodes } from "http-status-codes";
import { zoneService } from "../services";

// Create a new zone
export const createZone = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { success, message, data } = await zoneService.createZoneService(
      payload
    );
    res.status(StatusCodes.CREATED).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in createZone:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update an existing zone
export const updateZone = async (req: Request, res: Response) => {
  try {
     const id = Number(req.params.id)
     const payload = req.body
     const {success, message, data} = await zoneService.updateZoneService(id, payload)

    res.status(StatusCodes.OK).json({ success, message, data });
  } catch (error: any) {
    console.error("Error in updateZone:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all zones
export const getZone = async (req: Request, res: Response) => {
  try {
        const {success, message, data} = await zoneService.getZoneService()

    res.status(StatusCodes.OK).json({ success, message, data});
  } catch (error: any) {
    console.error("Error in getZone:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a zone
export const deleteZone = async (
  req: Request,
  res: Response
) => {
  try { 
         const id = Number(req.params.id)
        const{success, message} = await zoneService.deleteZoneService(id)
        res.status(StatusCodes.OK).json({success, message})
  } catch (error: any) {
    console.error("Error in deleteZone:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
