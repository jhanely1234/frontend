import { Navigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/auth.hook';

const UsersPage = () => {
  const {
    auth: { email, roles },
    isLoading,
  } = useAuth();

  if (isLoading) return <h1>Cargando...</h1>;

  const isRecepcionista = roles.some(role => role.name === 'recepcionista');

  return isRecepcionista ? (
    <div className='text-2xl'>
      Recepcionista - Users page - <span className='font-bold'>{email}</span>
      <div className='mt-4'>
        <Link to='/' className='text-center block'>
          Home page
        </Link>
        <Link to='/recepcionista' className='text-center block'>
          Dashboard
        </Link>
        <Link to='/recepcionista/gestor-productos' className='text-center block'>
          Gestor de Productos
        </Link>
      </div>
    </div>
  ) : (
    <Navigate to='/' />
  );
};

export default UsersPage;
