import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';

interface CredentialBackProps {
  profile: Profile;
  className?: string;
}

export function CredentialBack({ profile, className }: CredentialBackProps) {
  const publicUrl = `${window.location.origin}/profile/${profile.id}`;

  const dataRows = [
    profile.blood_type && {
      label: 'Sangre',
      value: profile.blood_type,
      isBlood: true,
    },
    profile.emergency_contact_name && {
      label: 'Emergencia',
      value: profile.emergency_contact_name,
    },
    profile.emergency_contact_phone && {
      label: 'Teléfono',
      value: profile.emergency_contact_phone,
    },
  ].filter(Boolean) as { label: string; value: string; isBlood?: boolean }[];

  return (
    <div className={cn('credential-card', className)}>
      {/* Gold line top */}
      <div
        className="h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent 5%, #6b572a 50%, transparent 95%)' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <span
          className="font-anton text-[11px] text-[#6b572a] uppercase"
          style={{ letterSpacing: '5px' }}
        >
          Perfil
        </span>
        <span
          className="font-anton text-[11px] text-[#1f1f1f] uppercase"
          style={{ letterSpacing: '5px' }}
        >
          ALTERADOS MC
        </span>
      </div>

      {/* Content */}
      <div className="px-6 flex flex-col items-center">
        {/* QR */}
        <div className="py-5 text-center">
          <div
            className="w-[140px] h-[140px] rounded-[2px] mx-auto flex items-center justify-center"
            style={{ backgroundColor: '#f5f0e6', padding: '10px' }}
          >
            <QRCodeSVG
              value={publicUrl}
              level="H"
              bgColor="#f5f0e6"
              fgColor="#0a0a0a"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <p
            className="text-[9px] text-[#2a2a2a] uppercase font-light mt-2.5"
            style={{ letterSpacing: '3px' }}
          >
            Escanear para ver perfil
          </p>
        </div>

        {/* Data rows */}
        <div className="w-full mt-2">
          {dataRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-2.5 border-t border-[#141414]"
            >
              <span
                className="text-[9px] text-[#4a4a4a] uppercase font-light"
                style={{ letterSpacing: '3px' }}
              >
                {row.label}
              </span>
              <span
                className={
                  row.isBlood
                    ? 'font-anton text-lg text-[#9b1c1c]'
                    : 'text-[13px] text-[#d4d0c8] text-right'
                }
                style={row.isBlood ? { letterSpacing: '1px' } : undefined}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="py-3 border-t border-[#141414] text-center">
          <p
            className="text-[8px] text-[#1f1f1f] uppercase font-light"
            style={{ letterSpacing: '2px' }}
          >
            Si encuentra esta credencial contacte al club
          </p>
        </div>
        <div
          className="h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent 5%, #6b572a 50%, transparent 95%)' }}
        />
      </div>
    </div>
  );
}
