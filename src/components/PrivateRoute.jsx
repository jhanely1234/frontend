// src/components/common/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/auth.hook";

const PrivateRoute = ({ element: Element, allowedRoles, ...rest }) => {
  const {
    auth: { roles },
    isLoading
  } = useAuth();

  if (isLoading) return <div>Cargando...</div>;

  const hasAccess = roles.some((role) => allowedRoles.includes(role.name));

  return hasAccess ? <Element {...rest} /> : <Navigate to="/" />;
};

export default PrivateRoute;
