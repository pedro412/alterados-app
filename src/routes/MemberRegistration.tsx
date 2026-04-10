import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProtectedContext } from '@/hooks/useProtectedContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { DateOfBirthPicker } from '@/components/ui/date-of-birth-picker';
import { ROLE_LABELS, MEMBER_TYPE_LABELS, BLOOD_TYPES } from '@/types';
import type { Role, MemberType, BloodType } from '@/types';

export function MemberRegistration() {
  const navigate = useNavigate();
  const { profile, isAdmin, isPresident } = useProtectedContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    nickname: '',
    date_of_birth: '',
    role: 'member' as Role,
    member_type: 'pilot' as MemberType,
    blood_type: '' as BloodType | '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  if (!isAdmin && !isPresident) {
    navigate('/');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const chapterId = profile?.chapter_id;
    if (!chapterId && !isAdmin) {
      setError('No tienes un capitulo asignado');
      setSaving(false);
      return;
    }

    // 1. Create auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          chapter_id: chapterId,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSaving(false);
      return;
    }

    const newUserId = signUpData.user?.id;
    if (!newUserId) {
      setError('Error al crear usuario');
      setSaving(false);
      return;
    }

    // 2. Update profile with extra fields
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nickname: form.nickname || null,
        date_of_birth: form.date_of_birth || null,
        role: form.role,
        member_type: form.member_type,
        blood_type: form.blood_type || null,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
      })
      .eq('id', newUserId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      setError('Usuario creado pero hubo error al actualizar perfil. Puedes editarlo despues.');
    } else {
      setSuccess(true);
    }
    setSaving(false);
  }

  if (success) {
    return (
      <div className="pt-18 pb-20 px-4 max-w-lg mx-auto space-y-4">
        <div className="p-4 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
          <p className="font-medium">Miembro registrado exitosamente</p>
          <p className="mt-1">
            El miembro puede iniciar sesion con el correo y contrasena proporcionados.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(false);
              setForm({
                full_name: '',
                email: '',
                password: '',
                nickname: '',
                date_of_birth: '',
                role: 'member',
                member_type: 'pilot',
                blood_type: '',
                emergency_contact_name: '',
                emergency_contact_phone: '',
              });
            }}
            className="flex-1"
          >
            Registrar otro
          </Button>
          <Button onClick={() => navigate(-1)} className="flex-1">
            Volver
          </Button>
        </div>
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
        <h1 className="text-xl font-bold">Registrar Miembro</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del nuevo miembro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {/* Required fields */}
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
                <Label htmlFor="email">Correo *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contrasena *</Label>
                <Input
                  id="password"
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Min. 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
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

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Registrando...' : 'Registrar miembro'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
