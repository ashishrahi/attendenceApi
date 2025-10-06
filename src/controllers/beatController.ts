import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BeatService } from '../services/index';
import BeatCreationAttributes from '../model/beatModel'


// create
export const createBeat = async (req: Request, res: Response) => {
  try {
   const  payload: BeatCreationAttributes = req.body;

const {success, message, data} = await BeatService.createBeatService(payload)
    
    res.status(StatusCodes.CREATED).json({
      success,
      message,
      data
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// get
export const getBeat = async (req: Request, res: Response) => {
  try {
   const{success, message, data} = await BeatService.getBeatService()

    res.status(StatusCodes.OK).json({
      success,
      message,
      data
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


export const updateBeat = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body;

   const{success, message} = await BeatService.updateBeatService(id, payload)

    res.status(StatusCodes.OK).json({
      success,
      message
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};



export const deleteBeat = async (req: Request, res: Response) => {
  try {
    const  id  = Number(req.params.id);
    const {success, message} = await BeatService.deleteBeatService(id);
    res.status(StatusCodes.OK).json({
      success,
      message
    })
    
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

