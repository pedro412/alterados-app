import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';

interface CredentialBackProps {
  profile: Profile;
  className?: string;
}

const ORANGE_GRADIENT = `linear-gradient(180deg,
  #FFE4C4 0%,
  #FFB67A 18%,
  #E8651F 45%,
  #B84410 75%,
  #FFB67A 100%)`;

const ORANGE = '#E8651F';
const ORANGE_DARK = '#A03808';
const ORANGE_LIGHT = '#FFB67A';

export function CredentialBack({ profile, className }: CredentialBackProps) {
  const publicUrl = `${window.location.origin}/profile/${profile.id}`;

  return (
    <div
      className={cn(
        'credential-card relative overflow-hidden select-none',
        'print:rounded-none print:shadow-none',
        className
      )}
      style={{
        aspectRatio: '85.6 / 54',
        background: '#0f0f0f',
      }}
    >
      {/* Top zone — black with logo */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '38%',
          background: `
            radial-gradient(ellipse 80% 100% at 50% 30%, rgba(232,101,31,0.1) 0%, transparent 70%),
            linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)
          `,
        }}
      >
        {/* Top noise */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Top edge */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: '2px',
            background: `linear-gradient(90deg, transparent 0%, ${ORANGE_DARK} 10%, ${ORANGE} 50%, ${ORANGE_DARK} 90%, transparent 100%)`,
          }}
        />

        {/* Logo MC centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p
              className="font-black uppercase leading-none"
              style={{
                fontSize: 'clamp(16px, 6.5cqi, 34px)',
                letterSpacing: '0.1em',
                background: ORANGE_GRADIENT,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.6)) drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
              }}
            >
              Alterados
            </p>
            <p
              className="font-black uppercase leading-none"
              style={{
                fontSize: 'clamp(8px, 3cqi, 16px)',
                letterSpacing: '0.4em',
                background: ORANGE_GRADIENT,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.5))',
                marginTop: '3%',
              }}
            >
              M C
            </p>
          </div>
        </div>
      </div>

      {/* Bottom zone — white with medical info */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-white"
        style={{ top: '38%' }}
      >
        {/* Watermark on white */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/nacionalmc.jpeg"
            alt=""
            className="rounded-full object-cover"
            style={{
              width: '38%',
              aspectRatio: '1',
              opacity: 0.07,
              filter: 'grayscale(100%)',
            }}
            crossOrigin="anonymous"
          />
        </div>

        {/* Bottom edge orange band */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '4%',
            background: `linear-gradient(180deg, ${ORANGE_LIGHT} 0%, ${ORANGE} 50%, ${ORANGE_DARK} 100%)`,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
          }}
        />

        {/* Content */}
        <div
          className="relative h-full flex items-center"
          style={{ padding: '4% 5% 7% 5%' }}
        >
          {/* QR */}
          <div className="shrink-0 flex flex-col items-center" style={{ gap: '4%' }}>
            <div
              className="bg-white"
              style={{
                padding: 'clamp(2px, 0.8cqi, 5px)',
                border: `1px solid ${ORANGE}`,
              }}
            >
              <QRCodeSVG
                value={publicUrl}
                level="H"
                bgColor="#ffffff"
                fgColor="#0a0a0a"
                className="credential-qr-lg"
              />
            </div>
            <p
              className="uppercase tracking-[0.15em] text-zinc-600 leading-none text-center"
              style={{ fontSize: 'clamp(4px, 1.2cqi, 6px)' }}
            >
              Verificar
            </p>
          </div>

          {/* Vertical orange divider */}
          <div
            className="self-stretch mx-[5%]"
            style={{
              width: '2px',
              background: `linear-gradient(180deg, transparent 0%, ${ORANGE} 20%, ${ORANGE} 80%, transparent 100%)`,
            }}
          />

          {/* Medical info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ gap: '8%' }}>
            {/* Blood type — prominent */}
            {profile.blood_type && (
              <div>
                <p
                  className="uppercase font-bold tracking-[0.15em] text-zinc-500 leading-none"
                  style={{
                    fontSize: 'clamp(5px, 1.6cqi, 8px)',
                    marginBottom: 'clamp(2px, 0.8cqi, 5px)',
                  }}
                >
                  Tipo de sangre
                </p>
                <span
                  className="inline-block font-black"
                  style={{
                    fontSize: 'clamp(16px, 6cqi, 30px)',
                    padding: 'clamp(2px, 0.6cqi, 4px) clamp(8px, 2.5cqi, 16px)',
                    background: ORANGE,
                    color: 'white',
                    letterSpacing: '0.05em',
                    boxShadow: `inset 0 -2px 0 ${ORANGE_DARK}`,
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
                  className="uppercase font-bold tracking-[0.15em] leading-none"
                  style={{
                    fontSize: 'clamp(5px, 1.6cqi, 8px)',
                    color: ORANGE_DARK,
                    marginBottom: 'clamp(2px, 0.8cqi, 5px)',
                  }}
                >
                  Contacto de emergencia
                </p>
                {profile.emergency_contact_name && (
                  <p
                    className="font-bold uppercase text-zinc-900 leading-tight"
                    style={{
                      fontSize: 'clamp(8px, 2.8cqi, 14px)',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {profile.emergency_contact_name}
                  </p>
                )}
                {profile.emergency_contact_phone && (
                  <p
                    className="font-bold text-zinc-900 leading-tight"
                    style={{
                      fontSize: 'clamp(9px, 3cqi, 15px)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {profile.emergency_contact_phone}
                  </p>
                )}
              </div>
            )}

            {/* Fallback if no medical info */}
            {!profile.blood_type &&
              !profile.emergency_contact_name &&
              !profile.emergency_contact_phone && (
                <p className="text-xs text-zinc-400 italic">
                  Sin información médica registrada
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
