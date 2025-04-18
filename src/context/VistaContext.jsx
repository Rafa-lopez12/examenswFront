import { createContext, useCallback, useContext, useState } from "react";
import { createVista, fetchProyectVista } from "../api/vista";


const VistaContext = createContext(null);

// Hook personalizado para usar el contexto de autenticación
export const useVista = () => {
  return useContext(VistaContext);
};


export const VistaProvider =({children})=>{
    const [vista, setVista]=useState(null)


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


    return (
        <VistaContext.Provider value={{
            vista,
            getVistas,
            crearVista,
        }}>
            {children}
        </VistaContext.Provider>
    )
}