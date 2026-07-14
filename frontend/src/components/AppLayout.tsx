import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
  }`;

export function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-slate-900">api-topaz</h1>
            <p className="text-sm text-slate-600">Encurtador de URLs</p>
          </div>

          <nav className="space-y-2">
            <NavLink to="/shorten" className={navLinkClass}>
              Encurtar URL
            </NavLink>
            <NavLink to="/urls" className={navLinkClass}>
              URLs salvas
            </NavLink>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Sair
          </button>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
