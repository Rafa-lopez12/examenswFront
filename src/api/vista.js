import instance from '../api/axios';


export const fetchProyectVista = (proyectoId) => 
  instance.get(`/vista/findall/${proyectoId}`);


export const createVista = (vistaData) => 
  instance.post('/vista', vistaData);