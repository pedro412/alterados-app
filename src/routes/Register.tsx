import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ROLE_LABELS } from '@/types';
import type { Chapter } from '@/types';

export function Register() {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('chapters').select('*').order('name').then(({ data }) => {
      if (data) setChapters(data);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, chapter_id: chapterId },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Update profile with chapter, name, and role
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ full_name: fullName, chapter_id: chapterId, role })
        .eq('id', data.user.id);
    }

    navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Registro</CardTitle>
          <CardDescription>Crea tu cuenta de Alterados MC</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter">Capitulo</Label>
              <Select
                id="chapter"
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                required
              >
                <option value="">Selecciona tu capitulo</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name} {ch.city ? `— ${ch.city}` : ''}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol en el club</Label>
              <Select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
              {role === 'president' && (
                <p className="text-xs text-amber-600">
                  Tu registro como presidente será verificado por un administrador.
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarme'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
