import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', end: true, label: 'Dashboard' },
  { to: '/admin/respondents', end: false, label: 'Respondientes' },
  { to: '/admin/import-export', end: false, label: 'Importar / Exportar' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-56 bg-slate-800 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-bold text-lg">Panel Admin</h2>
          <p className="text-slate-400 text-sm truncate" title={user?.name}>
            {user?.name}
          </p>
        </div>
        <nav className="p-2 flex-1">
          {navItems.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive ? 'bg-primary-500 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-700">
          <a
            href="/encuesta"
            className="block px-4 py-2 text-slate-400 hover:text-white text-sm"
          >
            Ir a encuesta (opcional)
          </a>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-slate-400 hover:text-white text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
