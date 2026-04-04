import { Link } from 'react-router';
import { Users, Cake, User, Settings, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS } from '@/types';
import { useProtectedContext } from '@/hooks/useProtectedContext';

export function Dashboard() {
  const { profile, isAdmin, isPresident } = useProtectedContext();

  if (!profile) return null;

  return (
    <div className="pt-18 pb-20 px-4 max-w-lg mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Hola, {profile.nickname || profile.full_name.split(' ')[0]}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
          {profile.chapter && (
            <span className="text-sm text-muted-foreground">{profile.chapter.name}</span>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/members">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <Users className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Miembros</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/birthdays">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <Cake className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Fechas</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/profile">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <User className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Mi Perfil</span>
            </CardContent>
          </Card>
        </Link>
        {isPresident && (
          <Link to="/chapter/settings">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <Settings className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">Mi Capitulo</span>
              </CardContent>
            </Card>
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <Shield className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">Admin</span>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
