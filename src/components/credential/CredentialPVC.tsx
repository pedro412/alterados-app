import { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { CredentialFront } from './CredentialFront';
import { CredentialBack } from './CredentialBack';
import type { Profile } from '@/types';

// Card size matches CSS (340×540), exported at 3x for high-res PNG
const CARD_W = 340;
const CARD_H = 540;
const EXPORT_SCALE = 3;

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
    pixelRatio: EXPORT_SCALE,
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
          <p className="text-sm text-muted-foreground mb-2">Frente (PVC alta resolución)</p>
          <CredentialFront profile={profile} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Reverso (PVC alta resolución)</p>
          <CredentialBack profile={profile} />
        </div>

        {/* Offscreen renders for high-res export */}
        <div
          aria-hidden
          style={{ position: 'absolute', left: '-9999px', top: 0 }}
        >
          <div ref={frontRef} style={{ width: CARD_W, height: CARD_H }}>
            <CredentialFront profile={profile} className="!rounded-none" />
          </div>
        </div>
        <div
          aria-hidden
          style={{ position: 'absolute', left: '-9999px', top: 0 }}
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
