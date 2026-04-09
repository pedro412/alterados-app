import { useState, useEffect, useRef } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProtectedContext } from '@/hooks/useProtectedContext';
import { Button } from '@/components/ui/button';
import { CredentialFront } from '@/components/credential/CredentialFront';
import { CredentialBack } from '@/components/credential/CredentialBack';
import { CredentialPVC } from '@/components/credential/CredentialPVC';
import type { CredentialPVCHandle } from '@/components/credential/CredentialPVC';
import type { Profile } from '@/types';

export function MemberCredential() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile: currentUser, isAdmin, isPresident } = useProtectedContext();
  const [member, setMember] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState<'print' | 'pvc'>('print');
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const pvcRef = useRef<CredentialPVCHandle>(null);

  const canAccess =
    isAdmin ||
    (isPresident && currentUser?.chapter_id === member?.chapter_id) ||
    currentUser?.id === id;

  useEffect(() => {
    async function fetchMember() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, chapter:chapters(*)')
        .eq('id', id!)
        .single();

      if (error) {
        console.error('Error fetching member:', error);
      } else {
        setMember(data as Profile);
      }
      setLoading(false);
    }
    fetchMember();
  }, [id]);

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    if (!pvcRef.current || !member) return;
    const safeName = member.full_name.replace(/\s+/g, '-').toLowerCase();
    pvcRef.current.downloadFront(`credencial-frente-${safeName}.png`);
    setTimeout(() => {
      pvcRef.current?.downloadBack(`credencial-reverso-${safeName}.png`);
    }, 500);
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

  if (!canAccess) return <Navigate to="/" replace />;

  return (
    <>
      {/* Screen UI */}
      <div className="pt-18 pb-20 px-4 max-w-lg mx-auto space-y-5 no-print">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-md hover:bg-accent cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Credencial</h1>
            <p className="text-sm text-muted-foreground">{member.full_name}</p>
          </div>
        </div>

        {/* Format toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setFormat('print')}
            className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
              format === 'print'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-accent'
            }`}
          >
            Impresion
          </button>
          <button
            onClick={() => setFormat('pvc')}
            className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
              format === 'pvc'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-accent'
            }`}
          >
            PVC
          </button>
        </div>

        {/* Card preview */}
        {format === 'print' ? (
          <div className="space-y-4">
            {/* Side toggle */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setActiveSide('front')}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                  activeSide === 'front'
                    ? 'bg-zinc-800 text-amber-400'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                }`}
              >
                Frente
              </button>
              <button
                onClick={() => setActiveSide('back')}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                  activeSide === 'back'
                    ? 'bg-zinc-800 text-amber-400'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                }`}
              >
                Reverso
              </button>
            </div>

            {/* Card container — responsive scaling */}
            <div className="flex justify-center">
              <div className="w-full max-w-[380px]">
                {activeSide === 'front' ? (
                  <CredentialFront profile={member} />
                ) : (
                  <CredentialBack profile={member} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <CredentialPVC ref={pvcRef} profile={member} />
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {format === 'print' ? (
            <Button onClick={handlePrint} className="flex-1 h-11">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          ) : (
            <Button onClick={handleDownload} className="flex-1 h-11">
              <Download className="h-4 w-4 mr-2" />
              Descargar PNG
            </Button>
          )}
        </div>
      </div>

      {/* Print-only content — side by side so you fold in half */}
      <div className="credential-print hidden print:flex print:flex-row print:items-start print:justify-center print:gap-0 print:pt-8">
        <div style={{ width: '85.6mm', height: '54mm' }}>
          <CredentialFront profile={member} />
        </div>
        <div style={{ width: '85.6mm', height: '54mm' }}>
          <CredentialBack profile={member} />
        </div>
      </div>
    </>
  );
}
