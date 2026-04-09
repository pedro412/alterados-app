import { cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/types';
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
    <div className={cn('credential-card', className)}>
      {/* Gold line top */}
      <div
        className="h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent 5%, #6b572a 50%, transparent 95%)' }}
      />

      {/* Header: wordmark + logo */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div>
          <p
            className="font-anton text-[13px] leading-[1.3] uppercase text-[#b8963e]"
            style={{ letterSpacing: '5px' }}
          >
            Alterados
            <br />
            Nacional
          </p>
          <span
            className="text-[9px] text-[#4a4a4a] font-light block"
            style={{ letterSpacing: '3px' }}
          >
            Moto Club
          </span>
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden border border-[#222] shrink-0">
          {chapter?.logo_url ? (
            <img
              src={chapter.logo_url}
              alt={chapter.name}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <img
              src="/nacionalmc.jpeg"
              alt="Alterados MC"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          )}
        </div>
      </div>

      {/* Photo */}
      <div className="flex justify-center py-2">
        <div className="w-[120px] h-[150px] rounded-[2px] overflow-hidden border border-[#1f1f1f] bg-[#111]">
          {profile.profile_photo_url ? (
            <img
              src={profile.profile_photo_url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(30%)' }}
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#222] text-4xl font-bold">
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Member info */}
      <div className="text-center px-6 pt-4">
        <p
          className="font-anton text-2xl text-[#d4d0c8] uppercase"
          style={{ letterSpacing: '2px' }}
        >
          {profile.full_name}
        </p>
        {profile.nickname && (
          <p
            className="text-sm text-[#b8963e] font-light uppercase mt-0.5"
            style={{ letterSpacing: '4px' }}
          >
            {profile.nickname}
          </p>
        )}

        {/* Divider */}
        <div className="w-6 h-px bg-[#6b572a] mx-auto my-3.5" />

        <p
          className="text-[11px] text-[#9b1c1c] uppercase font-semibold"
          style={{ letterSpacing: '5px' }}
        >
          {ROLE_LABELS[profile.role]}
        </p>
        {chapter && (
          <p
            className="text-[11px] text-[#4a4a4a] font-light mt-1.5"
            style={{ letterSpacing: '2px' }}
          >
            {chapter.name}
          </p>
        )}
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#141414]">
          <span
            className="text-[10px] text-[#2a2a2a] font-light"
            style={{ letterSpacing: '3px' }}
          >
            ALTERADOS MC
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#6b572a]" />
        </div>
        <div
          className="h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent 5%, #6b572a 50%, transparent 95%)' }}
        />
      </div>
    </div>
  );
}
