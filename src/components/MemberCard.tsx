import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS } from '@/types';
import type { Profile } from '@/types';

interface MemberCardProps {
  member: Profile;
  children?: React.ReactNode;
}

export function MemberCard({ member, children }: MemberCardProps) {
  const initials = member.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="flex items-center gap-3">
      {member.profile_photo_url ? (
        <img
          src={member.profile_photo_url}
          alt={member.full_name}
          className="h-10 w-10 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-medium">
          {member.full_name}
          {member.nickname && (
            <span className="text-muted-foreground font-normal"> "{member.nickname}"</span>
          )}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
          {children}
        </div>
      </div>
    </div>
  );
}
