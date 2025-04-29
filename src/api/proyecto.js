import instance from '../api/axios';


export const fetchUserProjects = (userId) => 
  instance.get(`/proyecto/findall/${userId}`);


export const createProject = (projectData) => 
  instance.post('/proyecto', projectData);

export const fetchProjectById = (projectId) => 
  instance.get(`/projects/${projectId}`);


export const updateProject = (projectId, projectData) => 
  instance.patch(`/proyecto/${projectId}`, projectData);

export const deleteProject = (projectId) => 
  instance.delete(`/projects/${projectId}`);