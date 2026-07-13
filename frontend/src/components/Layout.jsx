import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/compras', label: 'Compras', icon: '🛒' },
  { to: '/inventario', label: 'Inventario', icon: '📦' },
  { to: '/ventas', label: 'Ventas', icon: '💰' },
  { to: '/gastos', label: 'Gastos', icon: '💸' },
  { to: '/caja', label: 'Caja', icon: '🏦' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-black text-white flex flex-col shrink-0 border-r border-[#2a2a2a]">
        <div className="p-4 border-b border-[#2a2a2a] flex items-center gap-3">
          <img src="/logo.png" alt="Bombastic Dreamers" className="w-12 h-12 object-contain shrink-0" />
          <div>
            <h1 className="font-display text-2xl leading-none text-[#ffcc00]">BOMBASTIC</h1>
            <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase mt-0.5">Dreamers</p>
            {user?.usuario && <p className="text-xs text-gray-500 mt-2">👤 {user.usuario}</p>}
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#ffcc00] text-black'
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-[#ffcc00]'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-[#2a2a2a] space-y-1">
          <button
            onClick={() => api.backup()}
            className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-[#ffcc00] rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            💾 Backup BD
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-[#ffcc00] rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
