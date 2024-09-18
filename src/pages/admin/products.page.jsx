import { Navigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/auth.hook';

const ProductsPage = () => {
  const {
    auth: { email, },
    isLoading,
  } = useAuth();


  return (
      <div className='text-2xl'>
        Admin - Products page - <span className='font-bold'>{email}</span>
        <div className='mt-4'>
          <Link to='/' className='text-center block'>
            Home page
          </Link>
          <Link to='/admin' className='text-center block'>
            Dashboard
          </Link>
          <Link to='/admin/gestor-usuarios' className='text-center block'>
            Gestor de Usuarios
          </Link>
        </div>
      </div>
  )
};

export default ProductsPage;
