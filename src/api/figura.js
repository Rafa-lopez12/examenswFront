import instance from '../api/axios';


export const fetchVistaFigura = (vistaId) => 
  instance.get(`/figura/findall/${vistaId}`);


export const createVista = (figuraData) => 
  instance.post('/figura', figuraData);