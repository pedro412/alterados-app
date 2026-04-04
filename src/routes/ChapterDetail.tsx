import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { MapPin, Calendar, Settings, UserPlus, Droplets, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProtectedContext } from '@/hooks/useProtectedContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ROLE_LABELS, MEMBER_TYPE_LABELS } from '@/types';
import type { Chapter, Profile, Role, MemberType } from '@/types';

export function ChapterDetail() {
  const { id } = useParams();
  const { profile: currentUser, isAdmin, isPresident } = useProtectedContext();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canManage =
    isAdmin || (isPresident && currentUser?.chapter_id === id);

  useEffect(() => {
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

      setLoading(false);
    }
    fetchData();
  }, [id]);

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
                    <div className="flex items-center gap-3">
                      {member.profile_photo_url ? (
                        <img
                          src={member.profile_photo_url}
                          alt={member.full_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-muted-foreground">
                          {member.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {member.full_name}
                          {member.nickname && (
                            <span className="text-muted-foreground font-normal">
                              {' '}
                              "{member.nickname}"
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
                          <Badge variant="outline">{MEMBER_TYPE_LABELS[member.member_type]}</Badge>
                        </div>
                      </div>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => setEditingId(isEditing ? null : member.id)}
                        className="text-xs text-primary hover:underline cursor-pointer"
                      >
                        {isEditing ? 'Cerrar' : 'Editar'}
                      </button>
                    )}
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
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
