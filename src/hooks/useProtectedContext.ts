import { useOutletContext } from 'react-router';
import type { useAuth } from './useAuth';

export function useProtectedContext() {
  return useOutletContext<ReturnType<typeof useAuth>>();
}
