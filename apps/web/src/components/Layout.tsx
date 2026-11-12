import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { NotebookPen, Tags, Clock, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser, useLogout } from '@/api/auth';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { Button } from './ui';

const navItems = [
  { to: '/', label: 'Notes', icon: NotebookPen, end: true },
  { to: '/note-types', label: 'Note Types', icon: Tags, end: false },
  { to: '/break-calculator', label: 'Break Calculator', icon: Clock, end: false },
];

export function Layout() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/login'),
      onError: (err) => toast.error(apiErrorMessage(err)),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold text-slate-900">Note Manager</span>
          </div>
          <div className="flex items-center gap-3">
            {user && <span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span>}
            <Button variant="ghost" size="sm" onClick={handleLogout} disabled={logout.isPending}>
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
