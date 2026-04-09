import { cn } from '@/lib/utils';
import { ROLE_LABELS, MEMBER_TYPE_LABELS } from '@/types';
import type { Profile } from '@/types';

interface CredentialFrontProps {
  profile: Profile;
  className?: string;
}

export function CredentialFront({ profile, className }: CredentialFrontProps) {
  const chapter = profile.chapter;
  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

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
          radial-gradient(ellipse 120% 80% at 20% 100%, rgba(180,130,50,0.08) 0%, transparent 50%),
          radial-gradient(ellipse 80% 60% at 85% 15%, rgba(180,130,50,0.06) 0%, transparent 50%),
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

      {/* Content — tighter padding, full use of space */}
      <div className="relative h-full flex flex-col" style={{ padding: '3.5% 4%' }}>
        {/* Header: logos + club name */}
        <div className="flex items-center gap-[2%]">
          {/* Chapter logo */}
          {chapter?.logo_url ? (
            <img
              src={chapter.logo_url}
              alt={chapter.name}
              className="credential-logo-lg rounded-full object-cover shrink-0"
              style={{ border: '2px solid rgba(212,165,74,0.5)', boxShadow: '0 0 8px rgba(212,165,74,0.15)' }}
              crossOrigin="anonymous"
            />
          ) : (
            <div
              className="credential-logo-lg rounded-full bg-zinc-900 flex items-center justify-center font-bold shrink-0"
              style={{ border: '2px solid rgba(212,165,74,0.5)', color: '#D4A54A', fontSize: 'clamp(10px, 3cqi, 18px)' }}
            >
              {chapter?.name?.charAt(0) || 'A'}
            </div>
          )}

          {/* Club title — bigger */}
          <div className="flex-1 text-center min-w-0">
            <p
              className="font-black uppercase leading-none"
              style={{
                fontSize: 'clamp(10px, 3.8cqi, 20px)',
                letterSpacing: '0.12em',
                background: 'linear-gradient(180deg, #F5D98A 0%, #D4A54A 40%, #B48432 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Alterados MC
            </p>
            {chapter && (
              <p
                className="uppercase tracking-[0.15em] text-zinc-500 leading-none"
                style={{ fontSize: 'clamp(6px, 2cqi, 10px)', marginTop: '1px' }}
              >
                {chapter.name.replace('Alterados MC ', '')}
              </p>
            )}
          </div>

          {/* National logo */}
          <img
            src="/nacionalmc.jpeg"
            alt="Alterados MC Nacional"
            className="credential-logo-lg rounded-full object-cover shrink-0"
            style={{ border: '2px solid rgba(212,165,74,0.5)', boxShadow: '0 0 8px rgba(212,165,74,0.15)' }}
            crossOrigin="anonymous"
          />
        </div>

        {/* Thin divider */}
        <div style={{ height: '1px', margin: '2.5% 0', background: 'linear-gradient(90deg, transparent, rgba(212,165,74,0.3) 20%, rgba(212,165,74,0.3) 80%, transparent)' }} />

        {/* Body: photo + info — fills remaining space */}
        <div className="flex gap-[4%] flex-1 min-h-0">
          {/* Photo — taller */}
          {profile.profile_photo_url ? (
            <img
              src={profile.profile_photo_url}
              alt={profile.full_name}
              className="credential-photo-lg rounded-sm object-cover shrink-0 self-stretch"
              style={{ border: '2px solid rgba(212,165,74,0.35)', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
              crossOrigin="anonymous"
            />
          ) : (
            <div
              className="credential-photo-lg rounded-sm bg-zinc-900/80 flex items-center justify-center shrink-0 self-stretch"
              style={{ border: '2px solid rgba(212,165,74,0.35)', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
            >
              <span
                className="font-bold"
                style={{
                  fontSize: 'clamp(18px, 7cqi, 36px)',
                  background: 'linear-gradient(180deg, #F5D98A, #B48432)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {initials}
              </span>
            </div>
          )}

          {/* Info — fills right side */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-[6%]">
            {/* Name */}
            <p
              className="font-bold leading-[1.1] text-white"
              style={{ fontSize: 'clamp(16px, 6.5cqi, 34px)' }}
            >
              {profile.full_name}
            </p>

            {/* Nickname */}
            {profile.nickname && (
              <p
                className="italic leading-none"
                style={{ fontSize: 'clamp(11px, 4.2cqi, 22px)', color: '#D4A54A' }}
              >
                &ldquo;{profile.nickname}&rdquo;
              </p>
            )}

            {/* Role + member type */}
            <div className="flex items-center gap-[4%] flex-wrap">
              <span
                className="inline-block uppercase font-bold tracking-wider rounded-sm"
                style={{
                  fontSize: 'clamp(8px, 3cqi, 16px)',
                  padding: 'clamp(2px, 0.8cqi, 6px) clamp(6px, 2.2cqi, 14px)',
                  background: 'linear-gradient(135deg, rgba(180,132,50,0.25) 0%, rgba(212,165,74,0.15) 100%)',
                  border: '1px solid rgba(212,165,74,0.35)',
                  color: '#F5D98A',
                  letterSpacing: '0.1em',
                }}
              >
                {ROLE_LABELS[profile.role]}
              </span>
              <span
                className="uppercase tracking-wider text-zinc-500"
                style={{ fontSize: 'clamp(7px, 2.6cqi, 14px)' }}
              >
                {MEMBER_TYPE_LABELS[profile.member_type]}
              </span>
            </div>

            {/* Location */}
            {chapter && (chapter.city || chapter.state) && (
              <p
                className="text-zinc-400 leading-none"
                style={{ fontSize: 'clamp(8px, 3cqi, 15px)' }}
              >
                {[chapter.city, chapter.state].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
