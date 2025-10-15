import { Request, Response } from 'express';
import { apiSuccessResponse, apiErrorResponse } from '../../../utilities/apiResponse';
import {helpCreationService} from '../services/index';
import { StatusCodes } from 'http-status-codes';

// CREATE HelpCreation
export const createHelpCreationController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const {success, message, data}= await helpCreationService.createHelpCreationService(payload);
    res.status(201).json({success, message, data});

  } catch (error: any) {
    console.error('Error in createHelpCreation:', error);
    res.status(500).json(apiErrorResponse('Server error', 500, error.message));
  }
};

// UPDATE HelpCreation
export const updateHelpCreationController = async (req: Request, res: Response) => {
  try {
     const id = Number(req.params.id)
     const payload = req.body;

    const result = await helpCreationService.updateHelpCreationService(id, payload);
    res.json(apiSuccessResponse(result, 'Updated successfully'));

  } catch (error: any) {
    console.error('Error in updateHelpCreation:', error);
    res.status(500).json(apiErrorResponse('Server error', 500, error.message));
  }
};

// GET HelpCreation
export const getHelpCreationController = async (req: Request, res: Response) => {
  try {
    
    const {success, message, data} = await helpCreationService.getHelpCreationService();

    res.status(StatusCodes.OK).json({success, message, data})

  } catch (error: any) {
    console.error('Error in getHelpCreation:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(apiErrorResponse('Server error', 500, error.message));
  }
};

// DELETE HelpCreation
export const deleteHelpCreationController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {success, message} = await helpCreationService.deleteHelpCreationService(id)
    res.status(StatusCodes.OK).json({success, message})

  } catch (error: any) {
    console.error('Error in deleteHelpCreation:', error);
    res.status(500).json({success: false, message:"server Error"});
  }
};
