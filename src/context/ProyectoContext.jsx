import { createContext, useCallback, useContext, useState } from "react";
import { createProject, fetchUserProjects, updateProject } from "../api/proyecto";



const ProyectoContext = createContext(null);

// Hook personalizado para usar el contexto de autenticación
export const useProyecto = () => {
  return useContext(ProyectoContext);
};


export const ProyectoProvider =({children})=>{
    const [proyecto, setProyecto]=useState(null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


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

    const updateProyecto = async(proyectoId, updatedData) => {
        try {
            setLoading(true);
            setError(null);
            const res = await updateProject(proyectoId, updatedData);
            
            // Actualizar el estado con el proyecto actualizado
            setProyecto(prevProyectos => 
                prevProyectos.map(p => 
                    p.id === proyectoId ? {...p, ...res.data} : p
                )
            );
            
            return res.data;
        } catch (error) {
            console.log(error);
            setError(error.response?.data?.message || 'Error al actualizar proyecto');
            throw error;
        } finally {
            setLoading(false);
        }
    };


    return (
        <ProyectoContext.Provider value={{
            proyecto,
            loading,
            error,
            getProyectos,
            createProyecto,
            updateProyecto,
        }}>
            {children}
        </ProyectoContext.Provider>
    )
}
