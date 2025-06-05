const { 
  apiSuccessResponse, 
  apiErrorResponse 
} = require('../utilities/apiResponse');
const helpCreationService = require('../services/helpcreation.service');

const createHelpCreation = async (req, res) => {
  try {
    const { menuId, menuName, description } = req.body;
    const result = await helpCreationService.createHelpCreation(menuId, menuName, description);
    res.status(201).json(apiSuccessResponse(result, 'Added successfully', 201));
  } catch (error) {
    console.error('Error in createHelpCreation:', error);
    res.status(500).json(apiErrorResponse('Server error', 500, error.message));
  }
};

const updateHelpCreation = async (req, res) => {
  try {
    const { menuId, menuName, description } = req.body;
    const result = await helpCreationService.updateHelpCreation(menuId, menuName, description);
    res.json(apiSuccessResponse(result, 'Updated successfully'));
  } catch (error) {
    console.error('Error in updateHelpCreation:', error);
    res.status(500).json(apiErrorResponse('Server error', 500, error.message));
  }
};

const getHelpCreation = async (req, res) => {
  try {
    const { menuId } = req.query;
    const result = await helpCreationService.getHelpCreation(menuId);
    const message = menuId ? 'Fetched help creation by menuId' : 'Fetched all help creation data';
    res.json(apiSuccessResponse(result, message));
  } catch (error) {
    console.error('Error in getHelpCreation:', error);
    res.status(500).json(apiErrorResponse('Server error', 500, error.message));
  }
};

const deleteHelpCreation = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json(apiErrorResponse('Invalid ID', 400));
    }

    const isDeleted = await helpCreationService.deleteHelpCreation(id);
    
    if (isDeleted) {
      res.json(apiSuccessResponse(null, 'Deleted successfully'));
    } else {
      res.status(404).json(apiErrorResponse('Help creation entry not found', 404));
    }
  } catch (error) {
    console.error('Error in deleteHelpCreation:', error);
    res.status(500).json(apiErrorResponse('Server error', 500, error.message));
  }
};

module.exports = {
  getHelpCreation,
  createHelpCreation,
  updateHelpCreation,
  deleteHelpCreation
};