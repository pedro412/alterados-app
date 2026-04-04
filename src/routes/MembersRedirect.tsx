import { Navigate } from 'react-router';
import { useProtectedContext } from '@/hooks/useProtectedContext';

export function MembersRedirect() {
  const { profile, isAdmin, isPresident } = useProtectedContext();

  if (isAdmin || isPresident) {
    return <Navigate to="/chapters" replace />;
  }

  if (profile?.chapter_id) {
    return <Navigate to={`/chapters/${profile.chapter_id}`} replace />;
  }

  return (
    <div className="pt-18 pb-20 px-4 max-w-lg mx-auto">
      <p className="text-muted-foreground">No estas asignado a ningun capitulo.</p>
    </div>
  );
}
