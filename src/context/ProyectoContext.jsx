import { createContext, useCallback, useContext, useState } from "react";
import { createProject, fetchUserProjects } from "../api/proyecto";



const ProyectoContext = createContext(null);

// Hook personalizado para usar el contexto de autenticación
export const useProyecto = () => {
  return useContext(ProyectoContext);
};


export const ProyectoProvider =({children})=>{
    const [proyecto, setProyecto]=useState(null)


    const getProyectos=useCallback(async(usuarioId)=>{
        try {
            const res= await fetchUserProjects(usuarioId)
            setProyecto(res.data)
            console.log(res)
        } catch (error) {
            console.log(error)
        }
    },[])


    const createProyecto= async(proyecto)=>{
        try {
            console.log(proyecto)
            const res= await createProject(proyecto)
            setProyecto((prevProyecto)=> [...prevProyecto, res.data])
        } catch (error) {
            console.log(error)
        }
      
    }


    return (
        <ProyectoContext.Provider value={{
            proyecto,
            getProyectos,
            createProyecto,
        }}>
            {children}
        </ProyectoContext.Provider>
    )
}
