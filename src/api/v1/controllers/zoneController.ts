// controllers/ZoneController.ts
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { zoneService } from "../services";

// Create a new zone
export const createZoneController = async (req: Request, res: Response) => {
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
export const updateZoneController = async (req: Request, res: Response) => {
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
export const getZoneController = async (req: Request, res: Response) => {
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
export const deleteZoneController = async (
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
