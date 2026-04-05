import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';

interface CredentialBackProps {
  profile: Profile;
  className?: string;
}

export function CredentialBack({ profile, className }: CredentialBackProps) {
  const publicUrl = `${window.location.origin}/profile/${profile.id}`;

  return (
    <div
      className={cn(
        'credential-card relative overflow-hidden text-white select-none',
        'print:rounded-none print:shadow-none',
        className
      )}
      style={{
        aspectRatio: '85.6 / 54',
        background: `
          radial-gradient(ellipse 100% 80% at 50% 110%, rgba(180,130,50,0.06) 0%, transparent 50%),
          linear-gradient(145deg, #0a0a0a 0%, #111111 40%, #0d0d0d 70%, #080808 100%)
        `,
      }}
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gold foil strips */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, transparent 0%, #8B6914 15%, #D4A54A 30%, #F5D98A 50%, #D4A54A 70%, #8B6914 85%, transparent 100%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, transparent 0%, #8B6914 15%, #D4A54A 30%, #F5D98A 50%, #D4A54A 70%, #8B6914 85%, transparent 100%)' }} />

      {/* Inner frame */}
      <div className="absolute inset-[4px] rounded-sm pointer-events-none" style={{ border: '1px solid rgba(180,130,50,0.15)' }} />

      {/* Corner ornaments */}
      <div className="absolute top-[6px] left-[6px] w-3 h-3 border-t border-l border-amber-600/40" />
      <div className="absolute top-[6px] right-[6px] w-3 h-3 border-t border-r border-amber-600/40" />
      <div className="absolute bottom-[6px] left-[6px] w-3 h-3 border-b border-l border-amber-600/40" />
      <div className="absolute bottom-[6px] right-[6px] w-3 h-3 border-b border-r border-amber-600/40" />

      {/* Content — horizontal layout: QR left, info right */}
      <div className="relative h-full flex items-center" style={{ padding: '4% 5%' }}>
        {/* Left: QR code — big */}
        <div className="shrink-0 flex flex-col items-center gap-[3%]">
          <div
            className="rounded-sm"
            style={{
              padding: 'clamp(4px, 1.2cqi, 8px)',
              background: 'linear-gradient(135deg, rgba(212,165,74,0.2), rgba(180,132,50,0.1))',
              border: '1px solid rgba(212,165,74,0.3)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,165,74,0.1)',
            }}
          >
            <div className="bg-white rounded-[2px]" style={{ padding: 'clamp(3px, 1cqi, 7px)' }}>
              <QRCodeSVG
                value={publicUrl}
                level="H"
                bgColor="#ffffff"
                fgColor="#0a0a0a"
                className="credential-qr-lg"
              />
            </div>
          </div>
          <p
            className="uppercase tracking-[0.15em] text-zinc-600 leading-none text-center"
            style={{ fontSize: 'clamp(4px, 1.2cqi, 6px)' }}
          >
            Escanea para verificar
          </p>
        </div>

        {/* Vertical divider */}
        <div
          className="self-stretch mx-[4%]"
          style={{ width: '1px', background: 'linear-gradient(180deg, transparent, rgba(212,165,74,0.25) 20%, rgba(212,165,74,0.25) 80%, transparent)' }}
        />

        {/* Right: emergency info — stacked, larger */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-[8%]">
          {/* Club name */}
          <p
            className="font-black uppercase leading-none"
            style={{
              fontSize: 'clamp(8px, 2.8cqi, 14px)',
              letterSpacing: '0.15em',
              background: 'linear-gradient(180deg, #F5D98A 0%, #D4A54A 40%, #B48432 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Alterados MC
          </p>

          {/* Blood type — prominent */}
          {profile.blood_type && (
            <div>
              <p
                className="uppercase tracking-[0.1em] text-zinc-500 leading-none"
                style={{ fontSize: 'clamp(5px, 1.6cqi, 8px)', marginBottom: 'clamp(2px, 0.8cqi, 5px)' }}
              >
                Tipo de sangre
              </p>
              <span
                className="inline-block font-black rounded-sm"
                style={{
                  fontSize: 'clamp(14px, 5cqi, 26px)',
                  padding: 'clamp(1px, 0.4cqi, 3px) clamp(6px, 2cqi, 14px)',
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.2), rgba(185,28,28,0.1))',
                  border: '1px solid rgba(220,38,38,0.35)',
                  color: '#FCA5A5',
                  letterSpacing: '0.05em',
                }}
              >
                {profile.blood_type}
              </span>
            </div>
          )}

          {/* Emergency contact */}
          {(profile.emergency_contact_name || profile.emergency_contact_phone) && (
            <div>
              <p
                className="uppercase font-bold tracking-[0.12em] leading-none"
                style={{ fontSize: 'clamp(5px, 1.5cqi, 7px)', color: '#D4A54A', marginBottom: 'clamp(2px, 0.6cqi, 4px)' }}
              >
                En caso de accidente
              </p>
              {profile.emergency_contact_name && (
                <p
                  className="text-zinc-300 leading-tight"
                  style={{ fontSize: 'clamp(7px, 2.2cqi, 12px)' }}
                >
                  {profile.emergency_contact_name}
                </p>
              )}
              {profile.emergency_contact_phone && (
                <p
                  className="text-zinc-400 leading-tight"
                  style={{ fontSize: 'clamp(7px, 2.2cqi, 12px)' }}
                >
                  {profile.emergency_contact_phone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
