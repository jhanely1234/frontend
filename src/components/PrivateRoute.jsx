import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/auth.hook";

const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      position: "fixed",
      top: 0,
      left: 0,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "3px solid #f3f3f3",
        borderTop: "3px solid #3498db",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
    <span
      style={{
        position: "absolute",
        marginTop: "70px",
        fontSize: "16px",
        color: "#333",
      }}
    >
      Cargando...
    </span>
  </div>
);

const PrivateRoute = ({ element: Element, allowedRoles, ...rest }) => {
  const {
    auth: { roles },
    isLoading,
  } = useAuth();

  const token = localStorage.getItem("token"); // Asumiendo que el token está en localStorage

  // Si la aplicación está cargando los datos del usuario
  if (isLoading) return <LoadingSpinner />;

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/auth/login" />;
  }

  // Si hay token, verifica si el usuario tiene roles permitidos
  const hasAccess = roles?.some((role) => allowedRoles.includes(role.name));

  // Si el usuario tiene acceso, renderiza el componente correspondiente
  return hasAccess ? <Element {...rest} /> : <Navigate to="/" />;
};

export default PrivateRoute;
