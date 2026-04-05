import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { ArrowLeft, Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/cloudinary';
import { useProtectedContext } from '@/hooks/useProtectedContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Chapter } from '@/types';

export function AdminChapters() {
  const navigate = useNavigate();
  const { isAdmin } = useProtectedContext();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const emptyForm = { name: '', city: '', state: '', foundation_date: '', expected_members: 10, logo_url: '' };
  const [form, setForm] = useState(emptyForm);
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchChapters();
  }, []);

  async function fetchChapters() {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .order('name');

    if (error) console.error('Error fetching chapters:', error);
    else setChapters(data as Chapter[]);
    setLoading(false);
  }

  function startEdit(chapter: Chapter) {
    setShowNew(false);
    setEditingId(chapter.id);
    setForm({
      name: chapter.name,
      city: chapter.city || '',
      state: chapter.state || '',
      foundation_date: chapter.foundation_date || '',
      expected_members: chapter.expected_members,
      logo_url: chapter.logo_url || '',
    });
    setPendingLogo(null);
    setLogoPreview(null);
  }

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowNew(true);
  }

  function cancelForm() {
    setEditingId(null);
    setShowNew(false);
    setForm(emptyForm);
    setPendingLogo(null);
    setLogoPreview(null);
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
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

    const data = {
      name: form.name,
      city: form.city || null,
      state: form.state || null,
      foundation_date: form.foundation_date || null,
      expected_members: form.expected_members,
      logo_url: logoUrl || null,
    };

    if (editingId) {
      const { error } = await supabase.from('chapters').update(data).eq('id', editingId);
      if (error) {
        setMessage({ type: 'error', text: 'Error al actualizar capítulo' });
      } else {
        setMessage({ type: 'success', text: 'Capítulo actualizado' });
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from('chapters').insert(data);
      if (error) {
        setMessage({ type: 'error', text: 'Error al crear capítulo' });
      } else {
        setMessage({ type: 'success', text: 'Capítulo creado' });
        setShowNew(false);
      }
    }

    setForm(emptyForm);
    await fetchChapters();
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleDelete(chapter: Chapter) {
    if (!confirm(`¿Eliminar "${chapter.name}"? Los miembros quedarán sin capítulo.`)) return;

    setMessage(null);
    const { error } = await supabase.from('chapters').delete().eq('id', chapter.id);

    if (error) {
      setMessage({ type: 'error', text: 'Error al eliminar capítulo' });
    } else {
      setMessage({ type: 'success', text: 'Capítulo eliminado' });
      await fetchChapters();
    }
    setTimeout(() => setMessage(null), 3000);
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const chapterForm = (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSave} className="space-y-3">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {(logoPreview || form.logo_url) ? (
                <img
                  src={logoPreview || form.logo_url}
                  alt="Logo"
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground">
                  {form.name.charAt(0) || '?'}
                </div>
              )}
              <div>
                <Input type="file" accept="image/*" onChange={handleLogoSelect} />
                {pendingLogo && (
                  <p className="text-xs text-amber-600 mt-1">Se subirá al guardar</p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ch-name">Nombre *</Label>
            <Input
              id="ch-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Alterados MC Ciudad"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ch-city">Ciudad</Label>
              <Input
                id="ch-city"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-state">Estado</Label>
              <Input
                id="ch-state"
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ch-date">Fecha de fundación</Label>
              <Input
                id="ch-date"
                type="date"
                value={form.foundation_date}
                onChange={(e) => setForm((prev) => ({ ...prev, foundation_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-members">Miembros esperados</Label>
              <Input
                id="ch-members"
                type="number"
                min={1}
                value={form.expected_members}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, expected_members: parseInt(e.target.value) || 1 }))
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear capítulo'}
            </Button>
            <Button type="button" variant="outline" onClick={cancelForm}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="pt-18 pb-20 px-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-md hover:bg-accent cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Gestión de Capítulos</h1>
            <p className="text-sm text-muted-foreground">{chapters.length} capítulos</p>
          </div>
        </div>
        {!showNew && !editingId && (
          <Button size="sm" onClick={startNew}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
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

      {/* New chapter form */}
      {showNew && chapterForm}

      {/* Chapters list */}
      <div className="space-y-3">
        {chapters.map((chapter) =>
          editingId === chapter.id ? (
            <div key={chapter.id}>{chapterForm}</div>
          ) : (
            <Card key={chapter.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {chapter.logo_url ? (
                    <img
                      src={chapter.logo_url}
                      alt={chapter.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {chapter.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{chapter.name}</p>
                    {(chapter.city || chapter.state) && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {[chapter.city, chapter.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(chapter)}
                    className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(chapter)}
                    className="p-2 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
