import { useState, createContext, useEffect } from "react";
import axiosClient from "../services/axios.service";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticateUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const { data } = await axiosClient.get("/auth/me", config);
        setAuth(data); // Establece los datos del usuario autenticado desde la respuesta del servidor
      } catch (error) {
        setAuth({}); // Limpia la autenticación en caso de error
      } finally {
        setIsLoading(false);
      }
    };

    authenticateUser(); // Llama a la función para cargar los datos al montar el componente
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthContext;
