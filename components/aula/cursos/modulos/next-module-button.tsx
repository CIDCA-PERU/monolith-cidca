'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useCallback } from 'react';

interface Video {
  item_apar_id_int: number;
  item_apar_titulo_vac?: string | null;
  item_apar_url_vac?: string | null;
}

interface ModulesData {
  currentModuloId: number;
  modules: Array<{
    mod_id_int: number;
    mod_uuid?: string | null;
    videos: Video[];
  }>;
  cursoId: string;
}

export function NextModuleButton({ data }: { data: ModulesData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentVideoIndex = Number(searchParams.get('video') || 0);

  const handleNext = useCallback(() => {
    const currentModuleIndex = data.modules.findIndex(
      (m) => m.mod_id_int === data.currentModuloId
    );

    if (currentModuleIndex === -1) return;

    const currentModule = data.modules[currentModuleIndex];
    const nextVideoIndex = currentVideoIndex + 1;

    // Si hay más videos en el módulo actual
    if (nextVideoIndex < currentModule.videos.length) {
      const params = new URLSearchParams(searchParams);
      params.set('video', nextVideoIndex.toString());
      router.push(`?${params.toString()}`);
      return;
    }

    // Si no hay más videos, ir al siguiente módulo
    if (currentModuleIndex < data.modules.length - 1) {
      const nextModule = data.modules[currentModuleIndex + 1];
      const nextModuleId = nextModule.mod_uuid || nextModule.mod_id_int;
      router.push(
        `/aula/cursos/${data.cursoId}/modulos/${nextModuleId}?video=0`
      );
    }
  }, [data, currentVideoIndex, router, searchParams]);

  const currentModule = data.modules.find(
    (m) => m.mod_id_int === data.currentModuloId
  );
  const isLastVideoOfLastModule =
    currentVideoIndex === (currentModule?.videos.length ?? 0) - 1 &&
    data.modules.indexOf(currentModule!) === data.modules.length - 1;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleNext}
      disabled={isLastVideoOfLastModule}
      className="cursor-pointer gap-1 hover:text-white hover:bg-slate-800"
    >
      Siguiente
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
}
