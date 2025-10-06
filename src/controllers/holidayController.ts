import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { holidayService } from '../services/index';


// CREATE Holiday
export const createHolidayController = async (req: Request, res: Response) => {
  try {
        const payload = req.body
   const {success, message, data} = await holidayService.createHolidayService(payload)


    res.status(StatusCodes.CREATED).json({ success, message, data });

  } catch (error: any) {
    console.error('Error in createHoliday:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error', error: error.message });
  }
};

// UPDATE Holiday
export const updateHolidayController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const payload = req.body;
    const{success, message, data} = await holidayService.updateHolidayService(id, payload)

    res.status(StatusCodes.OK).json({ success, message, data});

  } catch (error: any) {
    console.error('Error in updateHoliday:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET All Holidays
export const getHolidaysController = async (_req: Request, res: Response) => {
  try {
   const{success, message, data} = await holidayService.getHolidayService()

    res.status(StatusCodes.OK).json({ success, message, data });

  } catch (error: any) {
    console.error('Error in getHolidays:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE Holiday
export const deleteHolidayController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {success, message, data} = await holidayService.deleteHolidayService(id)

  } catch (error: any) {
    console.error('Error in deleteHoliday:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
