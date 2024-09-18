import { Navigate, Link } from "react-router-dom";
import useAuth from "../../hooks/auth.hook";

const DashboardPage = () => {
  const {
    auth: { roles, email },
    isLoading
  } = useAuth();

  if (isLoading) return <h1>Cargando...</h1>;

  const isRecepcionista = roles.some((role) => role.name === "recepcionista");

  return isRecepcionista ? (
    <div className="text-2xl">
      Dashboard el usuario <span className="font-bold">{email}</span> es
      recepcionista
      <div className="mt-4">
        <Link to="/" className="text-center block">
          Home page
        </Link>
        <Link to="/recepcionista/gestor-usuarios" className="text-center block">
          Gestor de usuarios
        </Link>
        <Link
          to="/recepcionista/gestor-productos"
          className="text-center block"
        >
          Gestor de productos
        </Link>
      </div>
    </div>
  ) : (
    <Navigate to="/" />
  );
};

export default DashboardPage;
