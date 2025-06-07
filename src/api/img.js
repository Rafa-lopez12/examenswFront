// src/api/img.js
import instance from '../api/axios';

/**
 * Envía una captura de pantalla para generar código Angular
 * @param {File|Blob|string} image - La imagen a enviar (puede ser un archivo, un blob o una cadena base64)
 * @param {string} pageName - Nombre de la página
 * @param {string} description - Descripción opcional
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const generateFlutterCodeFromScreenshot = async (image, pageName, description, projectId = null) => {
  const formData = new FormData();

  try {
    let imageToSend;
    
    if (typeof image === 'string') {
      if (image.startsWith('data:image')) {
        imageToSend = await base64ToBlob(image);
      } else {
        imageToSend = await base64ToBlob(`data:image/png;base64,${image}`);
      }
    } else if (image instanceof Blob || image instanceof File) {
      imageToSend = image;
    } else {
      console.error('Formato de imagen no soportado:', typeof image);
      throw new Error('Formato de imagen no soportado');
    }
    
    // Añadir la imagen al FormData
    formData.append('image', imageToSend, `${pageName.replace(/\s+/g, '-')}.png`);
    
    // Añadir otros campos
    formData.append('pageName', pageName);
    formData.append('description', description || '');
    
    // NUEVO: Añadir projectId si está disponible
    if (projectId) {
      formData.append('projectId', projectId);
    }
    
    // Enviar la solicitud
    return instance.post('/code-generator/generate-flutter-from-screenshot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error) {
    console.error('Error preparando la imagen para enviar:', error);
    throw error;
  }
};


/**
 * Convierte un string base64 o una URL de datos en un Blob
 * @param {string} dataUrl - String base64 o URL de datos completa
 * @returns {Promise<Blob>} - Promesa con el blob de la imagen
 */
export const base64ToBlob = async (dataUrl) => {
  try {
    // Asegurarse de que tenemos una URL de datos completa
    let fullDataUrl = dataUrl;
    if (!dataUrl.startsWith('data:')) {
      fullDataUrl = `data:image/png;base64,${dataUrl}`;
    }
    
    // Método 1: Usar fetch para convertir (método preferido)
    try {
      const response = await fetch(fullDataUrl);
      if (!response.ok) {
        throw new Error(`Error al convertir con fetch: ${response.statusText}`);
      }
      return await response.blob();
    } catch (fetchError) {
      console.warn('Error usando fetch para convertir base64 a blob:', fetchError);
      // Si fetch falla, intentar el método manual
    }
    
    // Método 2: Convertir manualmente (respaldo)
    // Extraer la parte base64 si es una URL de datos completa
    const base64Data = fullDataUrl.split(',')[1];
    if (!base64Data) {
      throw new Error('Datos base64 inválidos');
    }
    
    // Decodificar la cadena base64
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    // Procesar los datos en bloques para evitar límites de memoria
    const sliceSize = 512;
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    // Crear y devolver el blob
    return new Blob(byteArrays, { type: 'image/png' });
  } catch (error) {
    console.error('Error al convertir base64 a blob:', error);
    throw new Error('No se pudo convertir la imagen a formato blob');
  }
};


export const generateUIFromImage = async (image, vistaId, description = '') => {
  const formData = new FormData();

  try {
    let imageToSend;
    
    if (typeof image === 'string') {
      if (image.startsWith('data:image')) {
        imageToSend = await base64ToBlob(image);
      } else {
        imageToSend = await base64ToBlob(`data:image/png;base64,${image}`);
      }
    } else if (image instanceof Blob || image instanceof File) {
      imageToSend = image;
    } else {
      console.error('Formato de imagen no soportado:', typeof image);
      throw new Error('Formato de imagen no soportado');
    }
    
    // Añadir la imagen al FormData
    formData.append('image', imageToSend, `ui-sketch-${Date.now()}.png`);
    
    // Añadir otros campos
    formData.append('vistaId', vistaId);
    formData.append('description', description);
    
    // Enviar la solicitud
    return instance.post('/code-generator/generate-ui-from-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error) {
    console.error('Error preparando la imagen para enviar:', error);
    throw error;
  }

  
};


export const generateUIFromPrompt = async (prompt, vistaId, options = {}) => {
  try {
    if (!prompt || !prompt.trim()) {
      throw new Error('El prompt es requerido');
    }
    
    if (!vistaId) {
      throw new Error('El ID de la vista es requerido');
    }
    
    // Enviar la solicitud al backend
    return instance.post('/code-generator/generate-ui-from-prompt', {
      prompt: prompt.trim(),
      vistaId: vistaId,
      options: {
        style: options.style || 'modern',
        colorScheme: options.colorScheme || 'default',
        complexity: options.complexity || 'medium'
      }
    });
  } catch (error) {
    console.error('Error preparando el prompt para enviar:', error);
    throw error;
  }
};

