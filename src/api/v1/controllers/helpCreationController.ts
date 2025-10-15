import { Request, Response } from 'express';
import { apiSuccessResponse, apiErrorResponse } from '../../utilities/apiResponse';
import * as helpCreationService from '../services/helpcreation.service';

// CREATE HelpCreation
export const createHelpCreation = async (req: Request, res: Response) => {
  try {
    const { menuId, menuName, description }: { menuId: number; menuName: string; description: string } = req.body;

    if (!menuId || !menuName) {
      return res.status(400).json(apiErrorResponse('menuId and menuName are required', 400));
    }

    const result = await helpCreationService.createHelpCreation(menuId, menuName, description);
    res.status(201).json(apiSuccessResponse(result, 'Added successfully', 201));

  } catch (error: any) {
    console.error('Error in createHelpCreation:', error);
    res.status(500).json(apiErrorResponse('Server error', 500, error.message));
  }
};

// UPDATE HelpCreation
export const updateHelpCreation = async (req: Request, res: Response) => {
  try {
    const { menuId, menuName, description }: { menuId: number; menuName: string; description: string } = req.body;

    if (!menuId || !menuName) {
      return res.status(400).json(apiErrorResponse('menuId and menuName are required', 400));
    }

    const result = await helpCreationService.updateHelpCreation(menuId, menuName, description);
    res.json(apiSuccessResponse(result, 'Updated successfully'));

  } catch (error: any) {
    console.error('Error in updateHelpCreation:', error);
    res.status(500).json(apiErrorResponse('Server error', 500, error.message));
  }
};

// GET HelpCreation
export const getHelpCreation = async (req: Request, res: Response) => {
  try {
    const menuId = req.query.menuId ? Number(req.query.menuId) : undefined;

    const result = await helpCreationService.getHelpCreation(menuId);
    const message = menuId ? 'Fetched help creation by menuId' : 'Fetched all help creation data';

    res.json(apiSuccessResponse(result, message));

  } catch (error: any) {
    console.error('Error in getHelpCreation:', error);
    res.status(500).json(apiErrorResponse('Server error', 500, error.message));
  }
};

// DELETE HelpCreation
export const deleteHelpCreation = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json(apiErrorResponse('Invalid ID', 400));
    }

    const isDeleted = await helpCreationService.deleteHelpCreation(id);

    if (isDeleted) {
      res.json(apiSuccessResponse(null, 'Deleted successfully'));
    } else {
      res.status(404).json(apiErrorResponse('Help creation entry not found', 404));
    }

  } catch (error: any) {
    console.error('Error in deleteHelpCreation:', error);
    res.status(500).json(apiErrorResponse('Server error', 500, error.message));
  }
};
