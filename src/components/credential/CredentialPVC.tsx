import { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { CredentialFront } from './CredentialFront';
import { CredentialBack } from './CredentialBack';
import { CredentialFrontV1 } from './CredentialFrontV1';
import { CredentialBackV1 } from './CredentialBackV1';
import type { Profile } from '@/types';

// CR-80 at 300 DPI
const CARD_W = 1012;
const CARD_H = 638;

export type CredentialVariant = 'v1' | 'v2';

export interface CredentialPVCHandle {
  downloadFront: (filename?: string) => void;
  downloadBack: (filename?: string) => void;
}

interface CredentialPVCProps {
  profile: Profile;
  variant?: CredentialVariant;
}

async function captureElement(el: HTMLElement, filename: string) {
  const dataUrl = await toPng(el, {
    width: CARD_W,
    height: CARD_H,
    pixelRatio: 1,
    cacheBust: true,
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export const CredentialPVC = forwardRef<CredentialPVCHandle, CredentialPVCProps>(
  ({ profile, variant = 'v2' }, ref) => {
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    useImperativeHandle(ref, () => ({
      async downloadFront(filename) {
        if (!frontRef.current || downloading) return;
        setDownloading(true);
        try {
          await captureElement(
            frontRef.current,
            filename ?? `credencial-frente-${variant}.png`
          );
        } finally {
          setDownloading(false);
        }
      },
      async downloadBack(filename) {
        if (!backRef.current || downloading) return;
        setDownloading(true);
        try {
          await captureElement(
            backRef.current,
            filename ?? `credencial-reverso-${variant}.png`
          );
        } finally {
          setDownloading(false);
        }
      },
    }));

    const Front = variant === 'v1' ? CredentialFrontV1 : CredentialFront;
    const Back = variant === 'v1' ? CredentialBackV1 : CredentialBack;

    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Frente (PVC 300 DPI)</p>
          <div className="w-full max-w-sm rounded-lg border border-zinc-300 overflow-hidden">
            <Front profile={profile} />
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Reverso (PVC 300 DPI)</p>
          <div className="w-full max-w-sm rounded-lg border border-zinc-300 overflow-hidden">
            <Back profile={profile} />
          </div>
        </div>

        {/* Offscreen renders at 300 DPI for export */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: CARD_W,
            height: CARD_H,
          }}
        >
          <div ref={frontRef} style={{ width: CARD_W, height: CARD_H }}>
            <Front profile={profile} className="!rounded-none" />
          </div>
        </div>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: CARD_W,
            height: CARD_H,
          }}
        >
          <div ref={backRef} style={{ width: CARD_W, height: CARD_H }}>
            <Back profile={profile} className="!rounded-none" />
          </div>
        </div>
      </div>
    );
  }
);
CredentialPVC.displayName = 'CredentialPVC';
