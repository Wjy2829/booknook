import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import clsx from 'classnames';

const navItems = [
  { label: '首页', to: '/' },
  { label: '我的书架', to: '/profile', requiresAuth: true },
  { label: '发布分享', to: '/share/new', requiresAuth: true },
];

export const NavBar = () => {
  const navigate = useNavigate();
  const { session, profile, isLoading } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="nav-content">
        <div className="logo" onClick={() => navigate('/')}>
          <span>BookNook</span>
          <small>小书角</small>
        </div>
        <nav>
          {navItems.map((item) => {
            if (item.requiresAuth && !session) {
              return (
                <button
                  key={item.to}
                  className="nav-link nav-disabled"
                  type="button"
                  onClick={() => navigate('/auth')}
                >
                  {item.label}
                </button>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx('nav-link', {
                    active: isActive,
                  })
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="nav-actions">
          {session && profile ? (
            <>
              <button type="button" className="ghost-btn" onClick={() => navigate('/profile')}>
                <img src={profile.avatar_url ?? `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`} alt={profile.username} />
                <span>{profile.username}</span>
              </button>
              <button type="button" className="primary-btn" onClick={handleLogout}>
                退出
              </button>
            </>
          ) : (
            <button type="button" className="primary-btn" disabled={isLoading} onClick={() => navigate('/auth')}>
              登录 / 注册
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

