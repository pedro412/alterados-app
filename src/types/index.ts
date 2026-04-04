export type Role =
  | 'admin'
  | 'president'
  | 'vice_president'
  | 'secretary'
  | 'treasurer'
  | 'road_captain'
  | 'sergeant_at_arms'
  | 'member';

export type MemberType = 'pilot' | 'copilot' | 'prospect';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Chapter {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  logo_url: string | null;
  foundation_date: string | null;
  expected_members: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  nickname: string | null;
  date_of_birth: string | null;
  chapter_id: string | null;
  role: Role;
  member_type: MemberType;
  blood_type: BloodType | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  profile_photo_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  joined_at: string;
  created_at: string;
  updated_at: string;
  // Joined data
  chapter?: Chapter;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  president: 'Presidente',
  vice_president: 'Vicepresidente',
  secretary: 'Secretario',
  treasurer: 'Tesorero',
  road_captain: 'Road Captain',
  sergeant_at_arms: 'Sargento de Armas',
  member: 'Miembro',
};

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  pilot: 'Piloto',
  copilot: 'Copiloto',
  prospect: 'Prospecto',
};

export const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
