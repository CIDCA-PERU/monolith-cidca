'use client';

import { Card } from '@/components/ui/card';
import { Video } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface ProcessedItem {
  item_apar_id_int: number;
  item_apar_titulo_vac?: string | null;
  item_apar_url_vac?: string | null;
  item_apar_tipo_vac?: string | null;
  embedUrl: string | null;
  tipo: {
    isVideo: boolean;
    isPdf: boolean;
    isExam: boolean;
  };
}

export function ModuleVideoPlayer({ items }: { items: ProcessedItem[] }) {
  const searchParams = useSearchParams();
  const currentVideoIndex = Number(searchParams.get('video') || 0);

  const videos = items.filter((item) => item.tipo.isVideo && item.embedUrl);

  if (videos.length === 0) {
    return null;
  }

  const currentVideo = videos[Math.min(currentVideoIndex, videos.length - 1)];

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2">
        <Video className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold">
          {currentVideo?.item_apar_titulo_vac || 'Video de la clase'}
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-300 ml-auto">
          {currentVideoIndex + 1} / {videos.length}
        </span>
      </div>
      <div className="aspect-video w-full overflow-hidden rounded-md bg-black/90">
        <iframe
          title={currentVideo?.item_apar_titulo_vac || 'Video'}
          src={currentVideo?.embedUrl || ''}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Card>
  );
}
