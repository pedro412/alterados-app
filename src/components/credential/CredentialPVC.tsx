import { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { CredentialFront } from './CredentialFront';
import { CredentialBack } from './CredentialBack';
import type { Profile } from '@/types';

// CR-80 at 300 DPI
const CARD_W = 1012;
const CARD_H = 638;

export interface CredentialPVCHandle {
  downloadFront: (filename?: string) => void;
  downloadBack: (filename?: string) => void;
}

interface CredentialPVCProps {
  profile: Profile;
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
  ({ profile }, ref) => {
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    useImperativeHandle(ref, () => ({
      async downloadFront(filename = 'credencial-frente.png') {
        if (!frontRef.current || downloading) return;
        setDownloading(true);
        try {
          await captureElement(frontRef.current, filename);
        } finally {
          setDownloading(false);
        }
      },
      async downloadBack(filename = 'credencial-reverso.png') {
        if (!backRef.current || downloading) return;
        setDownloading(true);
        try {
          await captureElement(backRef.current, filename);
        } finally {
          setDownloading(false);
        }
      },
    }));

    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Frente (PVC 300 DPI)</p>
          <div className="w-full max-w-sm rounded-lg border border-zinc-300 overflow-hidden">
            <CredentialFront profile={profile} />
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Reverso (PVC 300 DPI)</p>
          <div className="w-full max-w-sm rounded-lg border border-zinc-300 overflow-hidden">
            <CredentialBack profile={profile} />
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
            <CredentialFront profile={profile} className="!rounded-none" />
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
            <CredentialBack profile={profile} className="!rounded-none" />
          </div>
        </div>
      </div>
    );
  }
);
CredentialPVC.displayName = 'CredentialPVC';
