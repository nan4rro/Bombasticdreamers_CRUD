import { NavLink, Outlet } from 'react-router-dom';
import { api } from '../api/client';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/compras', label: 'Compras', icon: '🛒' },
  { to: '/inventario', label: 'Inventario', icon: '📦' },
  { to: '/ventas', label: 'Ventas', icon: '💰' },
  { to: '/gastos', label: 'Gastos', icon: '💸' },
  { to: '/caja', label: 'Caja', icon: '🏦' },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-lg font-bold leading-tight">Bombastic</h1>
          <p className="text-xs text-gray-400 mt-0.5">Dreamers</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700 space-y-1">
          <button
            onClick={() => api.backup()}
            className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            💾 Backup BD
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
