import { cn } from '@/lib/utils';
import { ROLE_LABELS, MEMBER_TYPE_LABELS } from '@/types';
import type { Profile } from '@/types';

interface CredentialFrontProps {
  profile: Profile;
  className?: string;
}

// Paleta MC: negro + naranja metálico + blanco
const ORANGE_GRADIENT = `linear-gradient(180deg,
  #FFE4C4 0%,
  #FFB67A 18%,
  #E8651F 45%,
  #B84410 75%,
  #FFB67A 100%)`;

const ORANGE = '#E8651F';
const ORANGE_DARK = '#A03808';
const ORANGE_LIGHT = '#FFB67A';

export function CredentialFront({ profile, className }: CredentialFrontProps) {
  const chapter = profile.chapter;
  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  const chapterShort = chapter?.name.replace(/Alterados MC\s*/i, '').trim() || '';

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
          radial-gradient(ellipse 90% 70% at 30% 30%, rgba(232,101,31,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 80% 60% at 80% 90%, rgba(232,101,31,0.06) 0%, transparent 60%),
          linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 50%, #050505 100%)
        `,
      }}
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Watermark moto silhouette (centered, very low opacity) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/nacionalmc.jpeg"
          alt=""
          className="rounded-full object-cover"
          style={{
            width: '60%',
            aspectRatio: '1',
            opacity: 0.08,
            filter: 'grayscale(100%) brightness(1.2)',
          }}
          crossOrigin="anonymous"
        />
      </div>

      {/* Right vertical orange band — signature stripe */}
      <div
        className="absolute top-0 bottom-0 right-0 pointer-events-none"
        style={{
          width: '5.5%',
          background: `linear-gradient(180deg, ${ORANGE_LIGHT} 0%, ${ORANGE} 50%, ${ORANGE_DARK} 100%)`,
          boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.4), inset -1px 0 0 rgba(0,0,0,0.5)',
        }}
      />

      {/* Top + bottom thin orange edges */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${ORANGE_DARK} 10%, ${ORANGE} 50%, ${ORANGE_DARK} 90%, transparent 100%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${ORANGE_DARK} 10%, ${ORANGE} 50%, ${ORANGE_DARK} 90%, transparent 100%)`,
        }}
      />

      {/* Content */}
      <div
        className="relative h-full flex flex-col"
        style={{ padding: '4% 8% 4% 4%' }}
      >
        {/* Header: club name + chapter logo */}
        <div className="flex items-center gap-[2%]">
          <div className="flex-1 text-center min-w-0">
            <p
              className="font-black uppercase leading-[0.95]"
              style={{
                fontSize: 'clamp(11px, 4.2cqi, 22px)',
                letterSpacing: '0.08em',
                background: ORANGE_GRADIENT,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.6)) drop-shadow(0 2px 2px rgba(0,0,0,0.4))',
              }}
            >
              Alterados MC
            </p>
            {chapterShort && (
              <p
                className="font-black uppercase leading-none"
                style={{
                  fontSize: 'clamp(9px, 3.4cqi, 18px)',
                  letterSpacing: '0.1em',
                  background: ORANGE_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.6))',
                  marginTop: '2px',
                }}
              >
                Capítulo {chapterShort}
              </p>
            )}
          </div>

          {chapter?.logo_url && (
            <img
              src={chapter.logo_url}
              alt={chapter.name}
              className="credential-logo-lg rounded-full object-cover shrink-0"
              style={{
                border: `2px solid ${ORANGE}`,
                boxShadow: `0 0 8px rgba(232,101,31,0.4)`,
              }}
              crossOrigin="anonymous"
            />
          )}
        </div>

        {/* Body: photo + info */}
        <div className="flex gap-[4%] flex-1 min-h-0" style={{ marginTop: '3%' }}>
          {/* Left column: photo + nickname (column fills body height) */}
          <div
            className="shrink-0 flex flex-col items-center h-full"
            style={{ width: '30%' }}
          >
            {/* Photo wrapper takes all remaining height; nickname sits below */}
            <div
              className="w-full"
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                border: `1px solid ${ORANGE}`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                background: '#0a0a0a',
              }}
            >
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={profile.full_name}
                  className="block w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className="font-black uppercase"
                    style={{
                      fontSize: 'clamp(20px, 8cqi, 40px)',
                      background: ORANGE_GRADIENT,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {profile.nickname && (
              <p
                className="font-black uppercase text-white text-center w-full shrink-0"
                style={{
                  fontSize: 'clamp(10px, 3.8cqi, 20px)',
                  letterSpacing: '0.05em',
                  marginTop: 'clamp(4px, 1.8cqi, 10px)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                  lineHeight: '1',
                }}
              >
                &ldquo;{profile.nickname}&rdquo;
              </p>
            )}
          </div>

          {/* Right column: info stacked */}
          <div className="flex-1 min-w-0 flex flex-col gap-[5%] justify-center">
            {/* Name */}
            <p
              className="font-bold uppercase text-white leading-[1.05]"
              style={{
                fontSize: 'clamp(11px, 4.4cqi, 22px)',
                letterSpacing: '0.02em',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}
            >
              {profile.full_name}
            </p>

            {/* Location */}
            {chapter && (chapter.city || chapter.state) && (
              <p
                className="uppercase text-white leading-[1.1]"
                style={{
                  fontSize: 'clamp(8px, 3cqi, 15px)',
                  letterSpacing: '0.08em',
                  opacity: 0.9,
                }}
              >
                {[chapter.city, chapter.state].filter(Boolean).join(', ')}
                {chapter.state && ', México'}
              </p>
            )}

            {/* Member type prominent */}
            <p
              className="font-bold uppercase text-white leading-none"
              style={{
                fontSize: 'clamp(10px, 3.8cqi, 20px)',
                letterSpacing: '0.12em',
              }}
            >
              {MEMBER_TYPE_LABELS[profile.member_type]}
            </p>

            {/* Role */}
            <p
              className="uppercase leading-none"
              style={{
                fontSize: 'clamp(6px, 2.2cqi, 11px)',
                letterSpacing: '0.12em',
                color: ORANGE_LIGHT,
              }}
            >
              Rol · {ROLE_LABELS[profile.role]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
