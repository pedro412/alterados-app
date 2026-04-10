import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/cloudinary';
import { useProtectedContext } from '@/hooks/useProtectedContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DateOfBirthPicker } from '@/components/ui/date-of-birth-picker';
import { ROLE_LABELS, MEMBER_TYPE_LABELS, BLOOD_TYPES } from '@/types';
import type { Role, MemberType, BloodType } from '@/types';

export function Profile() {
  const { profile, session, refreshProfile } = useProtectedContext();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    nickname: profile?.nickname || '',
    date_of_birth: profile?.date_of_birth || '',
    role: profile?.role || 'member',
    member_type: profile?.member_type || 'pilot',
    blood_type: (profile?.blood_type || '') as BloodType | '',
    emergency_contact_name: profile?.emergency_contact_name || '',
    emergency_contact_phone: profile?.emergency_contact_phone || '',
    profile_photo_url: profile?.profile_photo_url || '',
  });

  if (!profile) return null;

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    let photoUrl = form.profile_photo_url;

    // Upload photo to Cloudinary only on save
    if (pendingPhoto) {
      try {
        photoUrl = await uploadImage(pendingPhoto);
      } catch {
        setMessage({ type: 'error', text: 'Error al subir la foto' });
        setSaving(false);
        return;
      }
    }

    if (!profile) return;
    const roleChanged = form.role !== profile.role;
    const newRole = form.role as Role;

    // Warn president about losing control
    if (roleChanged && profile.role === 'president' && profile.is_verified && newRole !== 'president') {
      if (!confirm('Al cambiar tu rol dejarás de tener control sobre tu capítulo. ¿Estás seguro?')) {
        setSaving(false);
        return;
      }
    }

    const updateData: Record<string, unknown> = {
      full_name: form.full_name,
      nickname: form.nickname || null,
      date_of_birth: form.date_of_birth || null,
      member_type: form.member_type,
      blood_type: form.blood_type || null,
      emergency_contact_name: form.emergency_contact_name || null,
      emergency_contact_phone: form.emergency_contact_phone || null,
      profile_photo_url: photoUrl || null,
      role: newRole,
    };

    if (roleChanged && newRole === 'president') {
      updateData.is_verified = false;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id);

    if (error) {
      setMessage({ type: 'error', text: 'Error al guardar cambios' });
    } else {
      setPendingPhoto(null);
      setPhotoPreview(null);
      setForm((prev) => ({ ...prev, profile_photo_url: photoUrl }));
      if (roleChanged && newRole === 'president') {
        setMessage({
          type: 'success',
          text: 'Datos guardados. Tu solicitud de presidente será verificada por un administrador.',
        });
      } else {
        setMessage({ type: 'success', text: 'Datos guardados' });
      }
      await refreshProfile();
    }
    setSaving(false);
  }

  const selfRoles = Object.entries(ROLE_LABELS);

  return (
    <div className="pt-18 pb-20 px-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>

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
          <CardTitle>Datos personales</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo */}
            <div className="space-y-2">
              <Label>Foto de perfil</Label>
              <div className="flex items-center gap-4">
                {(photoPreview || form.profile_photo_url) ? (
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
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                value={session?.user?.email || ''}
                disabled
                className="bg-muted"
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
                <Label htmlFor="dob">Fecha de nacimiento</Label>
                <DateOfBirthPicker
                  id="dob"
                  value={form.date_of_birth}
                  onChange={(val) => setForm((prev) => ({ ...prev, date_of_birth: val }))}
                />
              </div>
            </div>

            {/* Rol en el club */}
            <div className="space-y-2">
              <Label htmlFor="role">Rol en el club</Label>
              <Select
                id="role"
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as Role }))}
              >
                {selfRoles.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              {form.role === 'president' && form.role !== profile.role && (
                <p className="text-xs text-amber-600">
                  Tu solicitud de presidente será verificada por un administrador.
                </p>
              )}
              {profile.role === 'president' && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={profile.is_verified ? 'default' : 'outline'}
                    className={
                      profile.is_verified
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'text-amber-600 border-amber-300'
                    }
                  >
                    {profile.is_verified ? 'Verificado' : 'Pendiente de verificación'}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="member_type">Tipo de miembro</Label>
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
                <Label htmlFor="emergency_phone">Telefono emergencia</Label>
                <Input
                  id="emergency_phone"
                  type="tel"
                  value={form.emergency_contact_phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, emergency_contact_phone: e.target.value }))
                  }
                  placeholder="Telefono"
                />
              </div>
            </div>

            {/* Chapter info (read-only) */}
            {profile.chapter && (
              <div className="p-3 bg-secondary rounded-md">
                <p className="text-sm font-medium">{profile.chapter.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[profile.chapter.city, profile.chapter.state].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
