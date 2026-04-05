import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router';
import { supabase } from '@/lib/supabase';
import { useProtectedContext } from '@/hooks/useProtectedContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck, Clock, MapPinned } from 'lucide-react';
import type { Profile } from '@/types';

interface PresidentWithChapter extends Omit<Profile, 'chapter'> {
  chapter: { id: string; name: string } | null;
}

export function AdminPanel() {
  const { isAdmin } = useProtectedContext();
  const [presidents, setPresidents] = useState<PresidentWithChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPresidents();
  }, []);

  async function fetchPresidents() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, chapter:chapters(id, name)')
      .eq('role', 'president')
      .order('is_verified')
      .order('full_name');

    if (error) {
      console.error('Error fetching presidents:', error);
    } else {
      setPresidents(data as PresidentWithChapter[]);
    }
    setLoading(false);
  }

  async function handleVerify(memberId: string) {
    setUpdatingId(memberId);
    setMessage(null);

    const member = presidents.find((p) => p.id === memberId);
    if (!member?.chapter) {
      setMessage({ type: 'error', text: 'Este miembro no tiene capitulo asignado' });
      setUpdatingId(null);
      return;
    }

    // Check if there's already a verified president for this chapter
    const existingPresident = presidents.find(
      (p) => p.chapter?.id === member.chapter?.id && p.is_verified && p.id !== memberId
    );

    if (existingPresident) {
      // Demote existing president to member
      const { error: demoteError } = await supabase
        .from('profiles')
        .update({ role: 'member', is_verified: false })
        .eq('id', existingPresident.id);

      if (demoteError) {
        setMessage({ type: 'error', text: 'Error al cambiar presidente anterior' });
        setUpdatingId(null);
        return;
      }
    }

    // Verify the new president
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', memberId);

    if (error) {
      setMessage({ type: 'error', text: 'Error al verificar' });
    } else {
      setMessage({
        type: 'success',
        text: existingPresident
          ? `${member.full_name} verificado. ${existingPresident.full_name} paso a miembro.`
          : `${member.full_name} verificado como presidente.`,
      });
      await fetchPresidents();
    }
    setUpdatingId(null);
  }

  async function handleReject(memberId: string) {
    setUpdatingId(memberId);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({ role: 'member', is_verified: false })
      .eq('id', memberId);

    if (error) {
      setMessage({ type: 'error', text: 'Error al rechazar' });
    } else {
      setMessage({ type: 'success', text: 'Rechazado. Rol cambiado a miembro.' });
      await fetchPresidents();
    }
    setUpdatingId(null);
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const pending = presidents.filter((p) => !p.is_verified);
  const verified = presidents.filter((p) => p.is_verified);

  // Detect conflicts: chapters with more than one president (verified or pending)
  const chapterCounts = new Map<string, number>();
  presidents.forEach((p) => {
    if (p.chapter?.id) {
      chapterCounts.set(p.chapter.id, (chapterCounts.get(p.chapter.id) || 0) + 1);
    }
  });
  const conflictChapters = new Set(
    [...chapterCounts.entries()].filter(([, count]) => count > 1).map(([id]) => id)
  );

  return (
    <div className="pt-18 pb-20 px-4 max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-sm text-muted-foreground">
            Gestión del club
          </p>
        </div>
      </div>

      {/* Admin quick actions */}
      <Link to="/admin/chapters">
        <Card className="hover:bg-accent transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPinned className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Gestión de Capítulos</p>
                <p className="text-sm text-muted-foreground">Agregar, editar o eliminar capítulos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Presidents verification */}
      <div>
        <h2 className="text-lg font-bold mb-1">Verificación de Presidentes</h2>
        <p className="text-sm text-muted-foreground">
          Aprueba o rechaza a quienes se registraron como presidente
        </p>
      </div>

      {message && (
        <div
          className={`p-3 text-sm rounded-md border ${
            message.type === 'success'
              ? 'text-green-700 bg-green-50 border-green-200'
              : 'text-red-600 bg-red-50 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Pending */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          Pendientes ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay solicitudes pendientes</p>
        ) : (
          pending.map((president) => {
            const hasConflict = president.chapter?.id
              ? conflictChapters.has(president.chapter.id)
              : false;
            const isUpdating = updatingId === president.id;

            return (
              <Card key={president.id} className={hasConflict ? 'border-amber-300' : ''}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{president.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {president.chapter?.name || 'Sin capitulo'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      Pendiente
                    </Badge>
                  </div>

                  {hasConflict && (
                    <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-md text-sm text-amber-700 border border-amber-200">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        Este capitulo ya tiene otro presidente registrado
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleVerify(president.id)}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {isUpdating ? 'Procesando...' : 'Verificar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(president.id)}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Verified */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          Verificados ({verified.length})
        </h2>
        {verified.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aun no hay presidentes verificados</p>
        ) : (
          verified.map((president) => (
            <Card key={president.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{president.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {president.chapter?.name || 'Sin capitulo'}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Verificado
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
