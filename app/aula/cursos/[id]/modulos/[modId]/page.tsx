import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Link as LinkIcon,
  Video,
  ClipboardList,
  Play,
  CheckCircle,
  FileArchive,
  Sparkles,
} from "lucide-react";
import {
  getApartadosByModulo,
  getApartadosByModuloIds,
  getComentariosByApartados,
  getItemsByApartados,
  getCursoById,
  getCursoByUuid,
  getModuloById,
  getModuloByUuid,
  getModulosByCurso,
} from "@/repository/aula.repository";
import { NextModuleButton } from "@/components/aula/cursos/modulos/next-module-button";
import { ModuleVideoPlayer } from "@/components/aula/cursos/modulos/module-video-player";
import { ComentariosSection } from "@/components/aula/cursos/modulos/comentarios-section";

export default async function AulaModuloPage({
  params,
}: {
  params: Promise<{ id: string; modId: string }>;
}) {
  const { id, modId } = await params;
  const cursoId = Number(id);
  const moduloId = Number(modId);

  const curso = Number.isNaN(cursoId)
    ? await getCursoByUuid(id)
    : await getCursoById(cursoId);
  if (!curso) {
    notFound();
  }

  const modulo = Number.isNaN(moduloId)
    ? await getModuloByUuid(modId)
    : await getModuloById(moduloId);
  if (!modulo) {
    notFound();
  }

  if (modulo.cur_id_int !== curso.cur_id_int) {
    notFound();
  }

  const modulos = await getModulosByCurso(curso.cur_id_int);
  const moduloIds = modulos.map((item) => item.mod_id_int);

  const [apartados, apartadosAll] = await Promise.all([
    getApartadosByModulo(modulo.mod_id_int),
    getApartadosByModuloIds(moduloIds),
  ]);

  const apartadoIds = apartados.map((apartado) => apartado.apar_id_int);
  const apartadoIdsAll = apartadosAll.map((apartado) => apartado.apar_id_int);

  const [items, comentarios, itemsAll] = await Promise.all([
    getItemsByApartados(apartadoIds),
    getComentariosByApartados(apartadoIds),
    getItemsByApartados(apartadoIdsAll),
  ]);

  const itemsByApartado = items.reduce<Record<number, typeof items>>(
    (acc, item) => {
      const key = item.apar_id_int;
      acc[key] = acc[key] ? [...acc[key], item] : [item];
      return acc;
    },
    {},
  );

  const apartadosByModulo = apartadosAll.reduce<
    Record<number, typeof apartadosAll>
  >((acc, apartado) => {
    const key = apartado.mod_id_int;
    acc[key] = acc[key] ? [...acc[key], apartado] : [apartado];
    return acc;
  }, {});

  const itemsAllByApartado = itemsAll.reduce<Record<number, typeof itemsAll>>(
    (acc, item) => {
      const key = item.apar_id_int;
      acc[key] = acc[key] ? [...acc[key], item] : [item];
      return acc;
    },
    {},
  );

  const normalizeType = (value?: string | null) => (value || "").toUpperCase();
  const isSeparator = (value?: string | null) =>
    normalizeType(value) === "SEPARADOR";
  const isPdf = (value?: string | null) => normalizeType(value) === "PDF";
  const isVideo = (value?: string | null) => normalizeType(value) === "VIDEO";
  const isExam = (value?: string | null) => normalizeType(value) === "EXAMEN";

  const getYouTubeEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
    if (!match) return null;
    return `https://www.youtube.com/embed/${match[1]}`;
  };

  const allItems = items.slice();
  const videoItem = allItems.find((item) => isVideo(item.item_apar_tipo_vac));
  const videoEmbedUrl = getYouTubeEmbedUrl(videoItem?.item_apar_url_vac);

  // Recopilar todos los items navegables (excluir separadores)
  const allNavigableItems = items
    .filter(
      (item) =>
        !isSeparator(item.item_apar_tipo_vac) &&
        !(
          isVideo(item.item_apar_tipo_vac) &&
          !getYouTubeEmbedUrl(item.item_apar_url_vac)
        ),
    )
    .map((item) => ({
      item_apar_id_int: item.item_apar_id_int,
      item_apar_titulo_vac: item.item_apar_titulo_vac,
      item_apar_url_vac: item.item_apar_url_vac,
      item_apar_tipo_vac: item.item_apar_tipo_vac,
      embedUrl: isVideo(item.item_apar_tipo_vac)
        ? getYouTubeEmbedUrl(item.item_apar_url_vac)
        : null,
      tipo: {
        isVideo: isVideo(item.item_apar_tipo_vac),
        isPdf: isPdf(item.item_apar_tipo_vac),
        isExam: isExam(item.item_apar_tipo_vac),
      },
    }));

  // Procesar módulos con sus videos
  const modulesWithVideos = modulos.map((mod) => {
    const moduleApartados = apartadosByModulo[mod.mod_id_int] || [];
    const moduleItems = moduleApartados
      .flatMap((apt) => itemsAllByApartado[apt.apar_id_int] || [])
      .filter((item) => isVideo(item.item_apar_tipo_vac) && getYouTubeEmbedUrl(item.item_apar_url_vac));

    return {
      mod_id_int: mod.mod_id_int,
      mod_uuid: mod.mod_uuid || undefined,
      videos: moduleItems.map((item) => ({
        item_apar_id_int: item.item_apar_id_int,
        item_apar_titulo_vac: item.item_apar_titulo_vac,
        item_apar_url_vac: item.item_apar_url_vac,
      })),
    };
  });

  const nextModuleData = {
    currentModuloId: modulo.mod_id_int,
    modules: modulesWithVideos,
    cursoId: curso.cur_uuid || curso.cur_id_int.toString(),
  };

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[7fr_3fr] min-w-0 overflow-hidden">
      <div className="space-y-4 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/aula/cursos/${curso.cur_uuid || curso.cur_id_int}`}
              className="text-accent"
            >
              Volver
            </Link>
            <span className="text-muted-foreground">/</span>
            <span>{modulo.mod_nomb_vac || `Modulo ${modId}`}</span>
          </div>
          <NextModuleButton data={nextModuleData} />
        </div>

        {videoEmbedUrl && (
          <ModuleVideoPlayer items={allNavigableItems} />
        )}

        {/* <ItemViewer items={allNavigableItems} />*/}

        <Tabs defaultValue="descripcion">
          <TabsList className="py-6 px-2 border-b border-border bg-slate-50 dark:bg-slate-900/30">
            <TabsTrigger value="descripcion" className="p-4">Descripcion</TabsTrigger>
            <TabsTrigger value="materiales" className="p-4">Materiales</TabsTrigger>
            <TabsTrigger value="comentarios" className="p-4">Comentarios</TabsTrigger>
          </TabsList>
          <TabsContent value="descripcion">
            <Card className="p-4 overflow-hidden">
              <p className="text-sm text-slate-600 dark:text-slate-200 [overflow-wrap:anywhere] whitespace-pre-line">
                {modulo.mod_desc_vac || "Descripcion del modulo."}
              </p>
            </Card>
          </TabsContent>
          <TabsContent value="materiales">
            <Card className="p-4 text-sm text-slate-600 dark:text-slate-200">
              {apartados.length === 0 ? (
                "No hay materiales registrados."
              ) : (
                <div className="space-y-4">
                  {apartados.map((apartado) => (
                    <div key={apartado.apar_id_int} className="space-y-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-yellow-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-foreground truncate">
                          {apartado.apar_nomb_vac || "Apartado"}
                        </span>
                      </div>
                      <ul className="space-y-1.5 ml-4">
                        {(itemsAllByApartado[apartado.apar_id_int] || []).map(
                          (item) => {
                            // SEPARADOR
                            if (isSeparator(item.item_apar_tipo_vac)) {
                              return (
                                <li key={item.item_apar_id_int} className="list-none">
                                  <div className="flex items-center gap-2 py-2 mt-1">
                                    <div className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-widest px-2.5 py-0.5 bg-accent/10 rounded-full border border-accent/20 whitespace-nowrap">
                                      <Sparkles className="h-2.5 w-2.5" />
                                      {item.item_apar_titulo_vac || item.item_apar_url_vac || 'Sección'}
                                    </span>
                                    <div className="h-px flex-1 bg-gradient-to-l from-accent/40 to-transparent" />
                                  </div>
                                </li>
                              );
                            }
                            if (
                              isVideo(item.item_apar_tipo_vac) &&
                              !getYouTubeEmbedUrl(item.item_apar_url_vac)
                            )
                              return null;

                            const Icon = isVideo(item.item_apar_tipo_vac)
                              ? Video
                              : isPdf(item.item_apar_tipo_vac)
                                ? FileText
                                : isExam(item.item_apar_tipo_vac)
                                  ? ClipboardList
                                  : normalizeType(item.item_apar_tipo_vac) === 'ARCHIVO'
                                    ? FileArchive
                                    : LinkIcon;

                            return (
                              <li
                                key={item.item_apar_id_int}
                                className="flex items-center gap-1.5"
                              >
                                <Icon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-300 flex-shrink-0" />
                                {item.item_apar_url_vac ? (
                                  <Link
                                    href={item.item_apar_url_vac}
                                    target="_blank"
                                    className="text-sm text-yellow-600 dark:text-yellow-300 hover:underline truncate"
                                  >
                                    {item.item_apar_titulo_vac || "Material"}
                                  </Link>
                                ) : (
                                  <span className="text-sm text-slate-600 dark:text-slate-200 truncate">
                                    {item.item_apar_titulo_vac || "Material"}
                                  </span>
                                )}
                              </li>
                            );
                          },
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
          <TabsContent value="comentarios">
            <Card className="p-4 overflow-hidden">
              <ComentariosSection
                comentarios={comentarios}
                aparId={apartados[0]?.apar_id_int ?? 0}
                currentPath={`/aula/cursos/${curso.cur_uuid || curso.cur_id_int}/modulos/${modulo.mod_uuid || modulo.mod_id_int}`}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-4 min-w-0">
        <Card className="p-3 space-y-2">
          <Accordion
            type="single"
            collapsible
            defaultValue={`mod-${moduloId}`}
            className="space-y-1.5"
          >
            {modulos.map((mod, idx) => {
              const isCurrentModule = mod.mod_id_int === modulo.mod_id_int;
              const href = `/aula/cursos/${curso.cur_uuid || curso.cur_id_int}/modulos/${mod.mod_uuid || mod.mod_id_int}`;

              return (
                <AccordionItem
                  key={mod.mod_id_int}
                  value={`mod-${mod.mod_id_int}`}
                  className="border-0"
                >
                  <div
                    className={`flex items-center gap-0 rounded transition-all ${
                      isCurrentModule
                        ? "bg-accent/15 border border-accent/40"
                        : "hover:bg-accent/5"
                    }`}
                  >
                    <Link
                      href={href}
                      className="flex-1 px-3 py-3 transition-colors"
                    >
                      <div className="text-[11px] text-slate-500 dark:text-slate-300 font-medium uppercase tracking-wide">
                        Módulo {idx + 1}
                      </div>
                      <div
                        className={`text-sm font-bold leading-snug ${
                          isCurrentModule ? "text-slate-900 dark:text-white" : "text-foreground"
                        }`}
                      >
                        {mod.mod_nomb_vac || `Módulo ${mod.mod_id_int}`}
                      </div>
                    </Link>

                    <AccordionTrigger className="flex-shrink-0 px-2 py-3 hover:no-underline hover:opacity-70" />
                  </div>

                  <AccordionContent className="pl-4 pt-2 pb-0 border-0">
                    {(apartadosByModulo[mod.mod_id_int] || []).length === 0 ? (
                      <div className="text-xs text-muted-foreground italic py-1">
                        Sin apartados
                      </div>
                    ) : (
                      (apartadosByModulo[mod.mod_id_int] || []).map(
                        (apartado) => (
                          <div
                            key={apartado.apar_id_int}
                            className="space-y-2 mb-3"
                          >
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-yellow-400 flex-shrink-0" />
                              <span className="text-sm font-semibold text-foreground truncate">
                                {apartado.apar_nomb_vac || "Apartado"}
                              </span>
                            </div>
                            <ul className="space-y-1.5 ml-4">
                              {(
                                itemsAllByApartado[apartado.apar_id_int] || []
                              ).map((item) => {
                                // SEPARADOR
                                if (isSeparator(item.item_apar_tipo_vac)) {
                                  return (
                                    <li key={item.item_apar_id_int} className="list-none">
                                      <div className="flex items-center gap-1.5 py-1.5 mt-0.5">
                                        <div className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-widest px-2 py-0.5 bg-accent/10 rounded-full border border-accent/20 whitespace-nowrap">
                                          <Sparkles className="h-2 w-2" />
                                          {item.item_apar_titulo_vac || item.item_apar_url_vac || 'Sección'}
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-l from-accent/40 to-transparent" />
                                      </div>
                                    </li>
                                  );
                                }
                                if (
                                  isVideo(item.item_apar_tipo_vac) &&
                                  !getYouTubeEmbedUrl(item.item_apar_url_vac)
                                )
                                  return null;

                                const Icon = isVideo(item.item_apar_tipo_vac)
                                  ? Video
                                  : isPdf(item.item_apar_tipo_vac)
                                    ? FileText
                                    : isExam(item.item_apar_tipo_vac)
                                      ? ClipboardList
                                      : normalizeType(item.item_apar_tipo_vac) === 'ARCHIVO'
                                        ? FileArchive
                                        : LinkIcon;

                                return (
                                  <li
                                    key={item.item_apar_id_int}
                                    className="flex items-center gap-1.5"
                                  >
                                    <Icon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-300 flex-shrink-0" />
                                    {item.item_apar_url_vac ? (
                                      <Link
                                        href={item.item_apar_url_vac}
                                        target="_blank"
                                        className="text-sm text-yellow-600 dark:text-yellow-300 hover:underline truncate"
                                      >
                                        {item.item_apar_titulo_vac ||
                                          "Material"}
                                      </Link>
                                    ) : (
                                      <span className="text-sm text-slate-600 dark:text-slate-200 truncate">
                                        {item.item_apar_titulo_vac ||
                                          "Material"}
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ),
                      )
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Card>

        <div className="space-y-2">
          <Button className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-12 gap-2 text-base">
            <Play className="h-5 w-5" />
            Ir a Zoom
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 gap-2 border-accent/30 hover:bg-accent/5 hover:border-accent text-slate-900 dark:text-white font-semibold hover:text-slate-900 dark:hover:text-white"
          >
            <CheckCircle className="h-5 w-5" />
            Marcar Asistencia
          </Button>
        </div>

        <Card className="p-4 bg-muted/50 border-muted-foreground/20">
          <p className="text-sm text-slate-600 dark:text-slate-300 text-center leading-relaxed">
            💡 <span className="font-semibold">Tip:</span> Para marcar asistencia, es necesario primero ingresar a la reunión vía Zoom
          </p>
        </Card>
      </div>
    </div>
  );
}
