import { Navigate } from 'react-router';
import { useProtectedContext } from '@/hooks/useProtectedContext';

export function ChapterSettingsRedirect() {
  const { profile } = useProtectedContext();

  if (profile?.chapter_id) {
    return <Navigate to={`/chapters/${profile.chapter_id}/settings`} replace />;
  }

  return <Navigate to="/" replace />;
}
