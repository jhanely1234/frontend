import { Navigate, Link } from "react-router-dom";
import useAuth from "../../hooks/auth.hook";

const UsersPage = () => {
  const {
    auth: { email },
    isLoading
  } = useAuth();

  return (
    <div className="text-2xl">
      Admin - Users page - <span className="font-bold">{email}</span>
      <div className="mt-4">
        <Link to="/" className="text-center block">
          Home page
        </Link>
        <Link to="/admin" className="text-center block">
          Dashboard
        </Link>
        <Link to="/admin/gestor-productos" className="text-center block">
          Gestor de Productos
        </Link>
      </div>
    </div>
  );
};

export default UsersPage;
