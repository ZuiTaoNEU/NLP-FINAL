import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate image from text prompt
export const generateImage = async (params) => {
  try {
    const response = await api.post('/generate', params);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Generate variations of an image
export const generateVariations = async (params) => {
  try {
    const response = await api.post('/variations', params);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get list of images
export const getImages = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get('/images', {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get image details by ID
export const getImageDetails = async (id) => {
  try {
    const response = await api.get(`/images/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Save user feedback for an image
export const saveFeedback = async (imageId, feedback) => {
  try {
    const response = await api.post('/feedback', {
      image_id: imageId,
      feedback,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Start model retraining
export const retrain = async (params) => {
  try {
    const response = await api.post('/retrain', params);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get training status
export const getTrainingStatus = async () => {
  try {
    const response = await api.get('/retrain/status');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Helper function to handle API errors
const handleApiError = (error) => {
  let errorMessage = 'An unknown error occurred';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    errorMessage = error.response.data.error || `Error: ${error.response.status}`;
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message;
  }
  
  return new Error(errorMessage);
};

export default api;