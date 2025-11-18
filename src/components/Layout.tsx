import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';

export const Layout = () => (
  <div className="app-shell">
    <NavBar />
    <main className="app-main">
      <Outlet />
    </main>
    <footer className="app-footer">
      <small>BookNook · 用最短的内容传递最有价值的读书体验</small>
    </footer>
  </div>
);

