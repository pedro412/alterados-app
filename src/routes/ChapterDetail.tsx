import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { MapPin, Calendar, Settings, UserPlus, Droplets, Phone, CreditCard, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProtectedContext } from '@/hooks/useProtectedContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { MemberCard } from '@/components/MemberCard';
import { ROLE_LABELS, MEMBER_TYPE_LABELS } from '@/types';
import type { Chapter, Profile } from '@/types';

export function ChapterDetail() {
  const { id } = useParams();
  const { profile: currentUser, isAdmin, isPresident } = useProtectedContext();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [unassigned, setUnassigned] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canManage =
    isAdmin || (isPresident && currentUser?.chapter_id === id);

  async function fetchData() {
    const [chapterRes, membersRes] = await Promise.all([
      supabase.from('chapters').select('*').eq('id', id!).single(),
      supabase
        .from('profiles')
        .select('*')
        .eq('chapter_id', id!)
        .order('full_name'),
    ]);

    if (chapterRes.error) console.error('Error fetching chapter:', chapterRes.error);
    else setChapter(chapterRes.data as Chapter);

    if (membersRes.error) console.error('Error fetching members:', membersRes.error);
    else setMembers(membersRes.data as Profile[]);

    // Fetch unassigned members if user can manage
    if (canManage) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .is('chapter_id', null)
        .order('full_name');
      if (data) setUnassigned(data as Profile[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  async function handleUnassign(memberId: string) {
    setMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({ chapter_id: null })
      .eq('id', memberId);

    if (error) {
      setMessage({ type: 'error', text: 'Error al desasignar miembro' });
    } else {
      setMessage({ type: 'success', text: 'Miembro desasignado del capítulo' });
      await fetchData();
    }
    setTimeout(() => setMessage(null), 2000);
  }

  async function handleDeleteMember(memberId: string, memberName: string) {
    if (!confirm(`¿Eliminar a "${memberName}"? Esta acción es irreversible y liberará su correo electrónico.`)) return;

    setMessage(null);
    const { error } = await supabase.rpc('delete_user', { user_id: memberId });

    if (error) {
      setMessage({ type: 'error', text: 'Error al eliminar miembro' });
    } else {
      setMessage({ type: 'success', text: `${memberName} eliminado` });
      await fetchData();
    }
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleAssign(memberId: string) {
    setMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({ chapter_id: id })
      .eq('id', memberId);

    if (error) {
      setMessage({ type: 'error', text: 'Error al asignar miembro' });
    } else {
      setMessage({ type: 'success', text: 'Miembro asignado al capítulo' });
      await fetchData();
    }
    setTimeout(() => setMessage(null), 2000);
  }

  async function handleUpdate(memberId: string, field: string, value: string) {
    setMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', memberId);

    if (error) {
      setMessage({ type: 'error', text: 'Error al actualizar' });
    } else {
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, [field]: value } : m))
      );
      setMessage({ type: 'success', text: 'Actualizado' });
    }
    setTimeout(() => setMessage(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="pt-18 pb-20 px-4 max-w-lg mx-auto">
        <p className="text-muted-foreground">Capitulo no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="pt-18 pb-20 px-4 max-w-lg mx-auto space-y-4">
      {/* Chapter header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {chapter.logo_url ? (
              <img
                src={chapter.logo_url}
                alt={chapter.name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-muted-foreground">
                {chapter.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{chapter.name}</h1>
              {(chapter.city || chapter.state) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[chapter.city, chapter.state].filter(Boolean).join(', ')}
                </p>
              )}
              {chapter.foundation_date && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fundado: {new Date(chapter.foundation_date).toLocaleDateString('es-MX')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Miembros registrados</span>
            <span className="font-medium">
              {members.length} / {chapter.expected_members}
            </span>
          </div>
          <Progress value={members.length} max={chapter.expected_members} />
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex gap-2">
            <Link to={`/chapters/${id}/settings`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configuracion
              </Button>
            </Link>
            <Link to="/members/new" className="flex-1">
              <Button className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Registrar
              </Button>
            </Link>
          </div>
        )}
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

      {/* Members list */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Miembros ({members.length})</h2>
        <div className="space-y-3">
          {members.map((member) => {
            const isEditing = editingId === member.id;
            const isSelf = member.id === currentUser?.id;
            const canEdit = canManage && !isSelf;

            return (
              <Card key={member.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <MemberCard member={member}>
                      <Badge variant="outline">{MEMBER_TYPE_LABELS[member.member_type]}</Badge>
                    </MemberCard>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/members/${member.id}/credential`}
                        className="text-xs text-muted-foreground hover:text-primary cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CreditCard className="h-4 w-4" />
                      </Link>
                      {canEdit && (
                        <button
                          onClick={() => setEditingId(isEditing ? null : member.id)}
                          className="text-xs text-primary hover:underline cursor-pointer"
                        >
                          {isEditing ? 'Cerrar' : 'Editar'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick info */}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {member.blood_type && (
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        {member.blood_type}
                      </span>
                    )}
                    {member.emergency_contact_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {member.emergency_contact_name || 'Emergencia'}
                      </span>
                    )}
                  </div>

                  {/* Edit mode */}
                  {isEditing && (
                    <div className="space-y-2 pt-2 border-t">
                      <div>
                        <label className="text-xs text-muted-foreground">Rol</label>
                        <Select
                          value={member.role}
                          onChange={(e) => handleUpdate(member.id, 'role', e.target.value)}
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Tipo de miembro</label>
                        <Select
                          value={member.member_type}
                          onChange={(e) =>
                            handleUpdate(member.id, 'member_type', e.target.value)
                          }
                        >
                          {Object.entries(MEMBER_TYPE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Estado</label>
                        <Select
                          value={member.is_active ? 'active' : 'inactive'}
                          onChange={(e) =>
                            handleUpdate(
                              member.id,
                              'is_active',
                              e.target.value === 'active' ? 'true' : 'false'
                            )
                          }
                        >
                          <option value="active">Activo</option>
                          <option value="inactive">Inactivo</option>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleUnassign(member.id)}
                        >
                          Desasignar
                        </Button>
                        {isAdmin && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id, member.full_name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Unassigned members */}
      {canManage && unassigned.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Sin capítulo ({unassigned.length})</h2>
          <p className="text-sm text-muted-foreground">
            Miembros que no pertenecen a ningún capítulo
          </p>
          <div className="space-y-3">
            {unassigned.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <MemberCard member={member} />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleAssign(member.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Asignar
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteMember(member.id, member.full_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
