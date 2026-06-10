import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';

export function CustomerLayout() {
  return (
    <>
      <Outlet />
      <Footer />
    </>
  );
}
