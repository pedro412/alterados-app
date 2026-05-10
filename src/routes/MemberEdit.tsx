import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Trash2, UserMinus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/cloudinary';
import { useProtectedContext } from '@/hooks/useProtectedContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { DateOfBirthPicker } from '@/components/ui/date-of-birth-picker';
import { ROLE_LABELS, MEMBER_TYPE_LABELS, BLOOD_TYPES } from '@/types';
import type { Profile, Role, MemberType, BloodType } from '@/types';

export function MemberEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile: currentUser, isAdmin, isPresident } = useProtectedContext();

  const [member, setMember] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    nickname: '',
    date_of_birth: '',
    role: 'member' as Role,
    member_type: 'pilot' as MemberType,
    blood_type: '' as BloodType | '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    profile_photo_url: '',
    is_active: true,
  });

  useEffect(() => {
    async function fetchMember() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, chapter:chapters(*)')
        .eq('id', id!)
        .single();

      if (error || !data) {
        setMessage({ type: 'error', text: 'No se pudo cargar el miembro' });
        setLoading(false);
        return;
      }

      const m = data as Profile;
      setMember(m);
      setForm({
        full_name: m.full_name || '',
        nickname: m.nickname || '',
        date_of_birth: m.date_of_birth || '',
        role: m.role,
        member_type: m.member_type,
        blood_type: (m.blood_type || '') as BloodType | '',
        emergency_contact_name: m.emergency_contact_name || '',
        emergency_contact_phone: m.emergency_contact_phone || '',
        profile_photo_url: m.profile_photo_url || '',
        is_active: m.is_active,
      });
      setLoading(false);
    }
    fetchMember();
  }, [id]);

  const isSelf = member?.id === currentUser?.id;
  const canManage =
    !!member &&
    !isSelf &&
    (isAdmin || (isPresident && currentUser?.chapter_id === member.chapter_id));

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!member) return;

    setSaving(true);
    setMessage(null);

    let photoUrl = form.profile_photo_url;
    if (pendingPhoto) {
      try {
        photoUrl = await uploadImage(pendingPhoto);
      } catch {
        setMessage({ type: 'error', text: 'Error al subir la foto' });
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        nickname: form.nickname || null,
        date_of_birth: form.date_of_birth || null,
        role: form.role,
        member_type: form.member_type,
        blood_type: form.blood_type || null,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
        profile_photo_url: photoUrl || null,
        is_active: form.is_active,
      })
      .eq('id', member.id);

    if (error) {
      setMessage({ type: 'error', text: 'Error al guardar cambios' });
    } else {
      setPendingPhoto(null);
      setPhotoPreview(null);
      setForm((prev) => ({ ...prev, profile_photo_url: photoUrl }));
      setMessage({ type: 'success', text: 'Cambios guardados' });
    }
    setSaving(false);
  }

  async function handleUnassign() {
    if (!member) return;
    if (!confirm(`¿Desasignar a "${member.full_name}" de su capítulo?`)) return;

    setMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({ chapter_id: null })
      .eq('id', member.id);

    if (error) {
      setMessage({ type: 'error', text: 'Error al desasignar' });
    } else {
      setMessage({ type: 'success', text: 'Miembro desasignado' });
      setTimeout(() => navigate(-1), 800);
    }
  }

  async function handleDelete() {
    if (!member) return;
    if (
      !confirm(
        `¿Eliminar a "${member.full_name}"? Esta acción es irreversible y liberará su correo electrónico.`
      )
    )
      return;

    setMessage(null);
    const { error } = await supabase.rpc('delete_user', { user_id: member.id });

    if (error) {
      setMessage({ type: 'error', text: 'Error al eliminar miembro' });
    } else {
      setMessage({ type: 'success', text: 'Miembro eliminado' });
      setTimeout(() => navigate(-1), 800);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="pt-18 pb-20 px-4 max-w-lg mx-auto">
        <p className="text-muted-foreground">Miembro no encontrado.</p>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="pt-18 pb-20 px-4 max-w-lg mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-md hover:bg-accent cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Editar Miembro</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {isSelf
            ? 'Para editar tu propio perfil ve a "Mi Perfil".'
            : 'No tienes permisos para editar este miembro.'}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-18 pb-20 px-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-md hover:bg-accent cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Editar Miembro</h1>
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

      <Card>
        <CardHeader>
          <CardTitle>Datos del miembro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo */}
            <div className="space-y-2">
              <Label>Foto de perfil</Label>
              <div className="flex items-center gap-4">
                {photoPreview || form.profile_photo_url ? (
                  <img
                    src={photoPreview || form.profile_photo_url}
                    alt="Foto"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-muted-foreground">
                    {form.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                )}
                <div>
                  <Input type="file" accept="image/*" onChange={handlePhotoSelect} />
                  {pendingPhoto && (
                    <p className="text-xs text-amber-600 mt-1">Se subirá al guardar cambios</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo *</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nickname">Apodo</Label>
                <Input
                  id="nickname"
                  value={form.nickname}
                  onChange={(e) => setForm((prev) => ({ ...prev, nickname: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
                <DateOfBirthPicker
                  id="date_of_birth"
                  value={form.date_of_birth}
                  onChange={(val) => setForm((prev) => ({ ...prev, date_of_birth: val }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as Role }))}
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="member_type">Tipo</Label>
                <Select
                  id="member_type"
                  value={form.member_type}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, member_type: e.target.value as MemberType }))
                  }
                >
                  {Object.entries(MEMBER_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="blood_type">Tipo de sangre</Label>
                <Select
                  id="blood_type"
                  value={form.blood_type}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, blood_type: e.target.value as BloodType }))
                  }
                >
                  <option value="">Seleccionar...</option>
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_active">Estado</Label>
                <Select
                  id="is_active"
                  value={form.is_active ? 'active' : 'inactive'}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, is_active: e.target.value === 'active' }))
                  }
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="emergency_name">Contacto de emergencia</Label>
                <Input
                  id="emergency_name"
                  value={form.emergency_contact_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, emergency_contact_name: e.target.value }))
                  }
                  placeholder="Nombre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Teléfono emergencia</Label>
                <Input
                  id="emergency_phone"
                  type="tel"
                  value={form.emergency_contact_phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, emergency_contact_phone: e.target.value }))
                  }
                  placeholder="Teléfono"
                />
              </div>
            </div>

            {member.chapter && (
              <div className="p-3 bg-secondary rounded-md">
                <p className="text-xs text-muted-foreground">Capítulo actual</p>
                <p className="text-sm font-medium">{member.chapter.name}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {member.chapter_id && (
            <Button variant="outline" className="w-full" onClick={handleUnassign}>
              <UserMinus className="h-4 w-4 mr-2" />
              Desasignar del capítulo
            </Button>
          )}
          {isAdmin && (
            <Button variant="destructive" className="w-full" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar miembro
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
