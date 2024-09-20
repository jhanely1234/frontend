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
        setIsLoading(false); // No hay token, ya podemos detener el loading
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
        setAuth(data); // Establecer los datos del usuario autenticado
      } catch (error) {
        setAuth({}); // Limpiar la autenticación en caso de error
      } finally {
        setIsLoading(false); // Termina de cargar
      }
    };

    authenticateUser();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthContext;
