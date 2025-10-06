import { zoneRepository } from "../repository";
import { handleUnknownError } from "../utilities/helper/handleUnknownError";
import Zone, { ZoneAttributes } from "../model/zoneModel";

// CREATE
export const createZoneService = async (payload: ZoneAttributes) => {
  try {
    const result = await zoneRepository.createZone(payload);
    return {
      success: true,
      message: "Zone created successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// READ (GET ALL)
export const getZoneService = async (payload?: ZoneAttributes) => {
  try {
    const result = await zoneRepository.getZones(payload);
    return {
      success: true,
      message: "Zone list fetched successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// UPDATE
export const updateZoneService = async (
  id: number,
  payload: ZoneAttributes
) => {
  try {
    const result = await zoneRepository.updateZone(id, payload);
    return {
      success: true,
      message: "Zone updated successfully",
      data: result,
    };
  } catch (error) {
    handleUnknownError(error);
  }
};

// DELETE
export const deleteZoneService = async (id: number) => {
  try {
    await zoneRepository.deleteZone(id);
    return {
      success: true,
      message: "Zone deleted successfully",
    };
  } catch (error) {
    handleUnknownError(error);
  }
};
