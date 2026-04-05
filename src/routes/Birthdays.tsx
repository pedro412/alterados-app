import { useState, useEffect } from 'react';
import { MapPin, Cake, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { MemberCard } from '@/components/MemberCard';
import type { Chapter, Profile } from '@/types';

interface ProfileWithChapter extends Omit<Profile, 'chapter'> {
  chapter: { name: string } | null;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function Birthdays() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [members, setMembers] = useState<ProfileWithChapter[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    async function fetchData() {
      const [chaptersRes, membersRes] = await Promise.all([
        supabase.from('chapters').select('*').order('name'),
        supabase.from('profiles').select('*, chapter:chapters(name)').eq('is_active', true).order('full_name'),
      ]);

      if (chaptersRes.data) setChapters(chaptersRes.data as Chapter[]);
      if (membersRes.data) setMembers(membersRes.data as ProfileWithChapter[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Filter chapters with anniversary this month
  const chapterAnniversaries = chapters
    .filter((ch) => {
      if (!ch.foundation_date) return false;
      const date = new Date(ch.foundation_date + 'T00:00:00');
      return date.getMonth() === selectedMonth;
    })
    .map((ch) => {
      const date = new Date(ch.foundation_date! + 'T00:00:00');
      const years = selectedYear - date.getFullYear();
      return { ...ch, day: date.getDate(), years };
    })
    .sort((a, b) => a.day - b.day);

  // Filter members with birthday this month
  const memberBirthdays = members
    .filter((m) => {
      if (!m.date_of_birth) return false;
      const date = new Date(m.date_of_birth + 'T00:00:00');
      return date.getMonth() === selectedMonth;
    })
    .map((m) => {
      const date = new Date(m.date_of_birth! + 'T00:00:00');
      const age = selectedYear - date.getFullYear();
      return { ...m, day: date.getDate(), age };
    })
    .sort((a, b) => a.day - b.day);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="pt-18 pb-20 px-4 max-w-lg mx-auto space-y-6">
      {/* Header + selectores */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Aniversarios y cumpleaños</h1>
        <div className="flex gap-3">
          <Select
            value={selectedMonth.toString()}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="flex-1"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i.toString()}>{name}</option>
            ))}
          </Select>
          <Select
            value={selectedYear.toString()}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-24 shrink-0"
          >
            {Array.from({ length: 3 }, (_, i) => now.getFullYear() - 2 + i).map((y) => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Chapter anniversaries */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          Aniversarios de capítulos
        </h2>

        {chapterAnniversaries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin aniversarios este mes</p>
        ) : (
          chapterAnniversaries.map((ch) => (
            <Card key={ch.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {ch.logo_url ? (
                    <img
                      src={ch.logo_url}
                      alt={ch.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {ch.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{ch.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[ch.city, ch.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{ch.day} de {MONTH_NAMES[selectedMonth]}</p>
                  <Badge variant="secondary">{ch.years} {ch.years === 1 ? 'año' : 'años'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Member birthdays */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Cake className="h-5 w-5 text-pink-500" />
          Cumpleaños ({memberBirthdays.length})
        </h2>

        {memberBirthdays.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin cumpleaños este mes</p>
        ) : (
          memberBirthdays.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <MemberCard member={m as unknown as Profile}>
                  <span className="text-xs text-muted-foreground">
                    {m.chapter?.name || 'Sin capítulo'}
                  </span>
                </MemberCard>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{m.day} de {MONTH_NAMES[selectedMonth]}</p>
                  <Badge variant="secondary">{m.age} años</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
