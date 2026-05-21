import { Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import api from '../services/api';

interface Props { children: ReactNode }


const Layout = ({ children }: Props) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-gray-900">Primetrade</span>
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Tasks</Link>
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-900">Admin</Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.username}</span>
            {user.role === 'ADMIN' && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
            )}
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default Layout;
