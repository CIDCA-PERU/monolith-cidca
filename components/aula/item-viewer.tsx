'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, FileText, ClipboardList, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface ItemViewerProps {
  items: ProcessedItem[];
}

export function ItemViewer({ items }: ItemViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  const getIcon = () => {
    if (currentItem.tipo.isVideo) return <Video className="h-4 w-4 text-accent" />;
    if (currentItem.tipo.isPdf) return <FileText className="h-4 w-4 text-accent" />;
    if (currentItem.tipo.isExam) return <ClipboardList className="h-4 w-4 text-accent" />;
    return <LinkIcon className="h-4 w-4 text-accent" />;
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        {getIcon()}
        <h3 className="text-sm font-semibold flex-1">
          {currentItem.item_apar_titulo_vac || 'Contenido'}
        </h3>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1} / {items.length}
        </span>
      </div>

      {/* Renderizar contenido según tipo */}
      {currentItem.tipo.isVideo && currentItem.embedUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-md bg-black/90 mb-4">
          <iframe
            title={currentItem.item_apar_titulo_vac || 'Video'}
            src={currentItem.embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {currentItem.tipo.isPdf && currentItem.item_apar_url_vac && (
        <div className="w-full h-96 rounded-md overflow-hidden bg-black/5 mb-4">
          <iframe
            title={currentItem.item_apar_titulo_vac || 'PDF'}
            src={`${currentItem.item_apar_url_vac}#toolbar=0`}
            className="h-full w-full"
            frameBorder="0"
          />
        </div>
      )}

      {!currentItem.tipo.isVideo && !currentItem.tipo.isPdf && currentItem.item_apar_url_vac && (
        <div className="mb-4 p-4 bg-muted/50 rounded-md">
          <a
            href={currentItem.item_apar_url_vac}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-semibold break-all"
          >
            {currentItem.item_apar_url_vac}
          </a>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === items.length - 1}
          className="flex-1"
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
