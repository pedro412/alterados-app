import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { MapPin, Users, ChevronRight, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProtectedContext } from '@/hooks/useProtectedContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Chapter } from '@/types';

interface ChapterWithCount extends Chapter {
  profiles: { count: number }[];
}

export function ChapterList() {
  const { profile } = useProtectedContext();
  const [chapters, setChapters] = useState<ChapterWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const myChapterId = profile?.chapter_id;

  useEffect(() => {
    async function fetchChapters() {
      const { data, error } = await supabase
        .from('chapters')
        .select('*, profiles(count)')
        .order('name');

      if (error) {
        console.error('Error fetching chapters:', error);
      } else {
        setChapters(data as ChapterWithCount[]);
      }
      setLoading(false);
    }
    fetchChapters();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="pt-18 pb-20 px-4 max-w-lg mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Capitulos</h1>
        <p className="text-sm text-muted-foreground">{chapters.length} sedes registradas</p>
      </div>

      <div className="space-y-3">
        {[...chapters]
          .sort((a, b) => {
            if (a.id === myChapterId) return -1;
            if (b.id === myChapterId) return 1;
            return 0;
          })
          .map((chapter) => {
            const memberCount = chapter.profiles?.[0]?.count ?? 0;
            const isMine = chapter.id === myChapterId;
            return (
              <Link key={chapter.id} to={`/chapters/${chapter.id}`}>
                <Card
                  className={cn(
                    'hover:bg-accent transition-colors cursor-pointer mb-3',
                    isMine && 'border-primary border-2'
                  )}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {chapter.logo_url ? (
                          <img
                            src={chapter.logo_url}
                            alt={chapter.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{chapter.name}</p>
                            {isMine && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Tu capitulo
                              </Badge>
                            )}
                          </div>
                          {(chapter.city || chapter.state) && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {[chapter.city, chapter.state].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Miembros</span>
                        <span className="font-medium">
                          {memberCount} / {chapter.expected_members}
                        </span>
                      </div>
                      <Progress value={memberCount} max={chapter.expected_members} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
