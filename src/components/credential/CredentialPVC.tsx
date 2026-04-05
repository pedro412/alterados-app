import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ROLE_LABELS } from '@/types';
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

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function drawFront(canvas: HTMLCanvasElement, profile: Profile) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = CARD_W;
  canvas.height = CARD_H;

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Gold accents top/bottom
  const gradient = ctx.createLinearGradient(0, 0, CARD_W, 0);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.5, '#f59e0b');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_W, 4);
  ctx.fillRect(0, CARD_H - 4, CARD_W, 4);

  // Chapter logo (left)
  const chapter = profile.chapter;
  if (chapter?.logo_url) {
    try {
      const logo = await loadImage(chapter.logo_url);
      ctx.save();
      ctx.beginPath();
      ctx.arc(70, 70, 40, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logo, 30, 30, 80, 80);
      ctx.restore();
      ctx.strokeStyle = 'rgba(245,158,11,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(70, 70, 40, 0, Math.PI * 2);
      ctx.stroke();
    } catch {
      // fallback circle
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.arc(70, 70, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(chapter?.name?.charAt(0) || 'A', 70, 78);
    }
  }

  // Club name center
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText('ALTERADOS MC', CARD_W / 2, 60);
  if (chapter) {
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '14px sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(chapter.name.replace('Alterados MC ', '').toUpperCase(), CARD_W / 2, 82);
  }
  ctx.letterSpacing = '0px';

  // National logo (right)
  try {
    const natLogo = await loadImage('/nacionalmc.jpeg');
    ctx.save();
    ctx.beginPath();
    ctx.arc(CARD_W - 70, 70, 40, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(natLogo, CARD_W - 110, 30, 80, 80);
    ctx.restore();
    ctx.strokeStyle = 'rgba(245,158,11,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CARD_W - 70, 70, 40, 0, Math.PI * 2);
    ctx.stroke();
  } catch {
    // skip if can't load
  }

  // Profile photo
  const photoX = 50;
  const photoY = 140;
  const photoW = 250;
  const photoH = 340;

  if (profile.profile_photo_url) {
    try {
      const photo = await loadImage(profile.profile_photo_url);
      ctx.save();
      roundRect(ctx, photoX, photoY, photoW, photoH, 8);
      ctx.clip();
      ctx.drawImage(photo, photoX, photoY, photoW, photoH);
      ctx.restore();
    } catch {
      // fallback
      ctx.fillStyle = '#27272a';
      roundRect(ctx, photoX, photoY, photoW, photoH, 8);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#27272a';
    roundRect(ctx, photoX, photoY, photoW, photoH, 8);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    const initials = profile.full_name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
    ctx.fillText(initials, photoX + photoW / 2, photoY + photoH / 2 + 20);
  }

  // Border around photo
  ctx.strokeStyle = 'rgba(245,158,11,0.4)';
  ctx.lineWidth = 3;
  roundRect(ctx, photoX, photoY, photoW, photoH, 8);
  ctx.stroke();

  // Name and info
  const textX = 340;
  ctx.textAlign = 'left';

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  const name = profile.full_name.length > 22 ? profile.full_name.slice(0, 22) + '...' : profile.full_name;
  ctx.fillText(name, textX, 190);

  if (profile.nickname) {
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'italic 22px sans-serif';
    ctx.fillText(`"${profile.nickname}"`, textX, 225);
  }

  // Role badge
  const roleY = profile.nickname ? 270 : 245;
  const roleText = ROLE_LABELS[profile.role].toUpperCase();
  ctx.font = 'bold 16px sans-serif';
  const roleWidth = ctx.measureText(roleText).width + 24;
  ctx.fillStyle = 'rgba(245,158,11,0.15)';
  roundRect(ctx, textX, roleY - 18, roleWidth, 28, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245,158,11,0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, textX, roleY - 18, roleWidth, 28, 4);
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(roleText, textX + 12, roleY + 4);

  // Chapter location
  if (chapter) {
    const location = [chapter.city, chapter.state].filter(Boolean).join(', ');
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '16px sans-serif';
    ctx.fillText(location, textX, roleY + 50);
  }
}

async function drawBack(canvas: HTMLCanvasElement, profile: Profile) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = CARD_W;
  canvas.height = CARD_H;

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Gold accents
  const gradient = ctx.createLinearGradient(0, 0, CARD_W, 0);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.5, '#f59e0b');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_W, 4);
  ctx.fillRect(0, CARD_H - 4, CARD_W, 4);

  // Header
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '6px';
  ctx.fillText('ALTERADOS MC', CARD_W / 2, 40);
  ctx.letterSpacing = '0px';

  // QR Code - render offscreen using a temporary canvas
  const publicUrl = `${window.location.origin}/profile/${profile.id}`;
  const qrSize = 220;
  const qrX = (CARD_W - qrSize - 16) / 2;
  const qrY = 65;

  // White background for QR
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrX, qrY, qrSize + 16, qrSize + 16, 8);
  ctx.fill();

  // Generate QR as data URL using a temporary QRCodeCanvas
  try {
    const { QRCodeCanvas } = await import('qrcode.react');
    const { createRoot } = await import('react-dom/client');
    const { createElement } = await import('react');

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    const root = createRoot(tempDiv);
    await new Promise<void>((resolve) => {
      root.render(
        createElement(QRCodeCanvas, {
          value: publicUrl,
          size: qrSize,
          level: 'H',
          ref: (el: HTMLCanvasElement | null) => {
            if (el) {
              ctx.drawImage(el, qrX + 8, qrY + 8, qrSize, qrSize);
              root.unmount();
              tempDiv.remove();
              resolve();
            }
          },
        })
      );
    });
  } catch {
    // Fallback: draw placeholder
    ctx.fillStyle = '#666';
    ctx.font = '14px sans-serif';
    ctx.fillText('QR Code', CARD_W / 2, qrY + qrSize / 2);
  }

  // Blood type
  const infoY = qrY + qrSize + 40;
  if (profile.blood_type) {
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TIPO DE SANGRE', CARD_W / 2, infoY);

    // Blood type badge
    const btText = profile.blood_type;
    ctx.font = 'bold 28px sans-serif';
    const btWidth = ctx.measureText(btText).width + 24;
    ctx.fillStyle = 'rgba(239,68,68,0.1)';
    roundRect(ctx, CARD_W / 2 - btWidth / 2, infoY + 8, btWidth, 36, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(239,68,68,0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, CARD_W / 2 - btWidth / 2, infoY + 8, btWidth, 36, 4);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.fillText(btText, CARD_W / 2, infoY + 34);
  }

  // Emergency contact
  if (profile.emergency_contact_name || profile.emergency_contact_phone) {
    const emY = profile.blood_type ? infoY + 60 : infoY;
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText('EN CASO DE ACCIDENTE', CARD_W / 2, emY);
    ctx.letterSpacing = '0px';

    ctx.fillStyle = '#d4d4d8';
    ctx.font = '16px sans-serif';
    const contact = [profile.emergency_contact_name, profile.emergency_contact_phone]
      .filter(Boolean)
      .join(' — ');
    ctx.fillText(contact, CARD_W / 2, emY + 22);
  }
}

export const CredentialPVC = forwardRef<CredentialPVCHandle, CredentialPVCProps>(
  ({ profile }, ref) => {
    const frontRef = useRef<HTMLCanvasElement>(null);
    const backRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (frontRef.current) drawFront(frontRef.current, profile);
      if (backRef.current) drawBack(backRef.current, profile);
    }, [profile]);

    useImperativeHandle(ref, () => ({
      downloadFront(filename = 'credencial-frente.png') {
        if (frontRef.current) downloadCanvas(frontRef.current, filename);
      },
      downloadBack(filename = 'credencial-reverso.png') {
        if (backRef.current) downloadCanvas(backRef.current, filename);
      },
    }));

    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Frente (PVC 300 DPI)</p>
          <canvas
            ref={frontRef}
            className="w-full max-w-sm rounded-lg border border-zinc-700"
            style={{ aspectRatio: `${CARD_W}/${CARD_H}` }}
          />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Reverso (PVC 300 DPI)</p>
          <canvas
            ref={backRef}
            className="w-full max-w-sm rounded-lg border border-zinc-700"
            style={{ aspectRatio: `${CARD_W}/${CARD_H}` }}
          />
        </div>
      </div>
    );
  }
);
CredentialPVC.displayName = 'CredentialPVC';
