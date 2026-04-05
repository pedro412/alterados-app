import { Link, useLocation } from 'react-router';
import { Home, Users, User, Settings, Shield, Cake } from 'lucide-react';
import type { Profile } from '@/types';
import { cn } from '@/lib/utils';

interface NavigationProps {
  profile: Profile | null;
  onLogout: () => void;
}

export function Navigation({ profile, onLogout }: NavigationProps) {
  const location = useLocation();
  const isAdmin = profile?.is_admin === true;
  const isPresident = profile?.role === 'president' && profile?.is_verified === true;

  const navItems = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/members', icon: Users, label: 'Miembros' },
    { to: '/birthdays', icon: Cake, label: 'Fechas' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-foreground">
          Alterados MC
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to="/admin"
              className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <Shield className="h-5 w-5" />
            </Link>
          )}
          {isPresident && (
            <Link
              to="/chapter/settings"
              className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
            </Link>
          )}
          <button
            onClick={onLogout}
            className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent cursor-pointer"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs',
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
