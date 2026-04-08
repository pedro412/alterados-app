import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS, MEMBER_TYPE_LABELS } from '@/types';
import type { Profile } from '@/types';
import { Droplets, Phone, User, MapPin, Shield } from 'lucide-react';

export function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchPublicProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, chapter:chapters(*)')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProfile(data as Profile);
      }
      setLoading(false);
    }

    fetchPublicProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-8 text-center space-y-3">
            <User className="h-12 w-12 text-muted-foreground mx-auto" />
            <h1 className="text-xl font-bold">Miembro no encontrado</h1>
            <p className="text-sm text-muted-foreground">
              Este perfil no existe o ya no está activo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-sm mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
            Alterados MC
          </p>
          <p className="text-xs text-muted-foreground">Credencial verificada</p>
        </div>

        {/* Main card */}
        <Card>
          <CardContent className="p-6 space-y-5">
            {/* Photo + name */}
            <div className="flex flex-col items-center gap-3">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={profile.full_name}
                  className="h-24 w-24 rounded-full object-cover border-2 border-amber-200"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-amber-50 flex items-center justify-center text-2xl font-bold text-amber-700 border-2 border-amber-200">
                  {profile.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
              )}
              <div className="text-center">
                <h1 className="text-xl font-bold">{profile.full_name}</h1>
                {profile.nickname && (
                  <p className="text-sm text-muted-foreground italic">"{profile.nickname}"</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  {ROLE_LABELS[profile.role]}
                </Badge>
                <Badge variant="outline">
                  {MEMBER_TYPE_LABELS[profile.member_type]}
                </Badge>
              </div>
            </div>

            {/* Chapter */}
            {profile.chapter && (
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
                {profile.chapter.logo_url ? (
                  <img
                    src={profile.chapter.logo_url}
                    alt={profile.chapter.name}
                    className="h-10 w-10 rounded-md object-contain"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-amber-100 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-amber-700" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{profile.chapter.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[profile.chapter.city, profile.chapter.state].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Blood type */}
            {profile.blood_type && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <Droplets className="h-5 w-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-xs text-red-600 font-medium">Tipo de sangre</p>
                  <p className="text-lg font-black text-red-700">{profile.blood_type}</p>
                </div>
              </div>
            )}

            {/* Emergency contact */}
            {(profile.emergency_contact_name || profile.emergency_contact_phone) && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <Phone className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs text-amber-700 font-medium">En caso de accidente</p>
                  {profile.emergency_contact_name && (
                    <p className="text-sm font-medium">{profile.emergency_contact_name}</p>
                  )}
                  {profile.emergency_contact_phone && (
                    <a
                      href={`tel:${profile.emergency_contact_phone}`}
                      className="text-sm text-amber-700 underline"
                    >
                      {profile.emergency_contact_phone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Perfil público de miembro activo de Alterados MC
        </p>
      </div>
    </div>
  );
}
