// src/api/codeGeneratorApi.js
import instance from '../api/axios';


export const generateCodeFromScreenshot = (image, pageName, description) => {
  const formData = new FormData();
  formData.append('image', image, `${pageName}.png`);
  formData.append('pageName', pageName);
  formData.append('description', description || '');

  return instance.post('/code-generator/generate-from-screenshot', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * Convierte un string base64 en un Blob
 * @param {string} base64Data - String base64 (sin el prefijo data:image/...)
 * @returns {Promise<Blob>} - Promesa con el blob de la imagen
 */
export const base64ToBlob = async (base64Data) => {
  return await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
};

