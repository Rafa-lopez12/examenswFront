import { createContext, useCallback, useContext, useState } from "react";
import { createVista, fetchProyectVista, updateVista } from "../api/vista";


const VistaContext = createContext(null);

// Hook personalizado para usar el contexto de autenticación
export const useVista = () => {
  return useContext(VistaContext);
};


export const VistaProvider =({children})=>{
    const [vista, setVista]=useState(null)

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getVistas=useCallback(async(proyectoId)=>{
        try {
            const res= await fetchProyectVista(proyectoId)
            setVista(res.data)
            console.log(res)
        } catch (error) {
            console.log(error)
        }
    },[])


    const crearVista= async(vista)=>{
        try {
            console.log(vista)
            const res= await createVista(vista)
            setVista((prevVista)=> [...prevVista, res.data])
        } catch (error) {
            console.log(error)
        }
      
    }

    const actualizarVista = async(vistaId, vistaData) => {
        try {
            setLoading(true);
            setError(null);
            const res = await updateVista(vistaId, vistaData);
            
            // Actualizar el estado con la vista actualizada
            setVista(prevVistas => 
                prevVistas.map(v => 
                    v.id === vistaId ? {...v, ...res.data} : v
                )
            );
            
            return res.data;
        } catch (error) {
            console.log(error);
            setError(error.response?.data?.message || 'Error al actualizar la vista');
            throw error;
        } finally {
            setLoading(false);
        }
    };


    return (
        <VistaContext.Provider value={{
            vista,
            getVistas,
            crearVista,
            actualizarVista,
        }}>
            {children}
        </VistaContext.Provider>
    )
}