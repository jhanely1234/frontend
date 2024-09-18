import { Link } from "react-router-dom";
import useAuth from "../../hooks/auth.hook";

const HomePage = () => {
  const {
    auth: { email, _id, roles },
    isLoading
  } = useAuth();

  if (isLoading) return <h1>Cargando...</h1>;

  const isAdmin = roles.some((role) => role.name === "admin");
  const isRecepcionista = roles.some((role) => role.name === "recepcionista");
  const isMedico = roles.some((role) => role.name === "medico");
  const isPaciente = roles.some((role) => role.name === "paciente");

  return !_id ? (
    <div className="text-2xl"> No se ha iniciado sesión </div>
  ) : (
    <div className="block space-y-4 text-2xl">
      <div className="text-center">
        Home Page - <span className="font-bold">{email}</span>
      </div>
      <div>
        <Link to="/tienda" className="text-center block">
          Tienda
        </Link>
        {isAdmin && (
          <Link to="/admin" className="text-center block">
            Dashboard admin
          </Link>
        )}
        {isMedico && (
          <Link to="/medico" className="text-center block">
            Dashboard MEDICO
          </Link>
        )}
        {isPaciente && (
          <Link to="/paciente" className="text-center block">
            Dashboard PACIENTE
          </Link>
        )}
        {isRecepcionista && (
          <Link to="/recepcionista" className="text-center block">
            Dashboard RECEPCIONISTA
          </Link>
        )}
      </div>
    </div>
  );
};

export default HomePage;
