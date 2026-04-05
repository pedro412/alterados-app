import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/cloudinary';
import { useProtectedContext } from '@/hooks/useProtectedContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Chapter } from '@/types';

export function ChapterSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, isAdmin, isPresident } = useProtectedContext();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    city: '',
    state: '',
    foundation_date: '',
    expected_members: 0,
    logo_url: '',
  });

  const canAccess = isAdmin || (isPresident && profile?.chapter_id === id);

  useEffect(() => {
    async function fetchChapter() {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id!)
        .single();

      if (error) {
        console.error('Error fetching chapter:', error);
      } else {
        const ch = data as Chapter;
        setChapter(ch);
        setForm({
          name: ch.name,
          city: ch.city || '',
          state: ch.state || '',
          foundation_date: ch.foundation_date || '',
          expected_members: ch.expected_members,
          logo_url: ch.logo_url || '',
        });
      }
      setLoading(false);
    }
    fetchChapter();
  }, [id]);

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    let logoUrl = form.logo_url;

    if (pendingLogo) {
      try {
        logoUrl = await uploadImage(pendingLogo);
      } catch {
        setMessage({ type: 'error', text: 'Error al subir el logo' });
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from('chapters')
      .update({
        name: form.name,
        city: form.city || null,
        state: form.state || null,
        foundation_date: form.foundation_date || null,
        expected_members: form.expected_members,
        logo_url: logoUrl || null,
      })
      .eq('id', id!);

    if (error) {
      setMessage({ type: 'error', text: 'Error al guardar cambios' });
    } else {
      setPendingLogo(null);
      setLogoPreview(null);
      setForm((prev) => ({ ...prev, logo_url: logoUrl }));
      setMessage({ type: 'success', text: 'Cambios guardados' });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!canAccess) return <Navigate to="/" replace />;
  if (!chapter) {
    return (
      <div className="pt-18 pb-20 px-4 max-w-lg mx-auto">
        <p className="text-muted-foreground">Capitulo no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="pt-18 pb-20 px-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/chapters/${id}`)}
          className="p-2 rounded-md hover:bg-accent cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Configuracion del Capitulo</h1>
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
          <CardTitle>Informacion del capitulo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                {(logoPreview || form.logo_url) ? (
                  <img
                    src={logoPreview || form.logo_url}
                    alt="Logo"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-muted-foreground">
                    {form.name.charAt(0)}
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                  />
                  {pendingLogo && (
                    <p className="text-xs text-amber-600 mt-1">Se subirá al guardar cambios</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="foundation_date">Fecha de fundacion</Label>
                <Input
                  id="foundation_date"
                  type="date"
                  value={form.foundation_date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, foundation_date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_members">Miembros esperados</Label>
                <Input
                  id="expected_members"
                  type="number"
                  min={1}
                  value={form.expected_members}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      expected_members: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
