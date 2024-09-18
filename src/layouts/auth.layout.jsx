import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <main className='items-center justify-center'>
      <Outlet />
    </main>
  );
};

export default AuthLayout;
