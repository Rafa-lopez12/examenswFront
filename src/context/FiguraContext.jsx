import { createContext, useCallback, useContext, useState } from "react";
import { fetchVistaFigura } from "../api/figura";


const FiguraContext = createContext(null);

// Hook personalizado para usar el contexto de autenticación
export const useFigura = () => {
  return useContext(FiguraContext);
};

export const FiguraProvider =({children})=>{
    const [figura, setFigura]=useState([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const getFiguras=useCallback(async(vistaId)=>{
        if (!vistaId) return;
    
        setLoading(true);
        setError(null);
        
        try {
            const res= await fetchVistaFigura(vistaId)
            setFigura(res.data)
        } catch (error) {
            console.log(error)
            setError(err.message || 'Error al cargar las figuras');
            return [];
        } finally{
            setLoading(false);
        }
    },[])


    // const crearFigura= async(vista)=>{
    //     try {
    //         console.log(vista)
    //         const res= await createVista(vista)
    //         setVista((prevVista)=> [...prevVista, res.data])
    //     } catch (error) {
    //         console.log(error)
    //     }
      
    // }
    const actualizarFigurasLocalmente = useCallback((nuevaFiguraOFiguras, tipo = 'actualizar') => {
        // Si es un array, asumimos que es un reemplazo completo
        if (Array.isArray(nuevaFiguraOFiguras)) {
          setFigura(nuevaFiguraOFiguras);
          return;
        }
        
        // Si es una sola figura
        const nuevaFigura = nuevaFiguraOFiguras;
        
        setFigura(prevFiguras => {
          // Buscar si la figura ya existe
          const figuraExistente = prevFiguras.find(fig => fig.id === nuevaFigura.id);
          
          if (tipo === 'agregar' || !figuraExistente) {
            // Si es una nueva figura, agregarla al array
            return [...prevFiguras, nuevaFigura];
          } else if (tipo === 'actualizar') {
            // Si es una actualización, reemplazar la figura existente
            return prevFiguras.map(fig => 
              fig.id === nuevaFigura.id ? nuevaFigura : fig
            );
          } else if (tipo === 'eliminar') {
            // Si es una eliminación, filtrar la figura
            return prevFiguras.filter(fig => fig.id !== nuevaFigura.id);
          }
          
          return prevFiguras;
        });
      }, []);


    return (
        <FiguraContext.Provider value={{
            figura,
            loading,
            error,
            getFiguras,
            actualizarFigurasLocalmente
        }}>
            {children}
        </FiguraContext.Provider>
    )
}