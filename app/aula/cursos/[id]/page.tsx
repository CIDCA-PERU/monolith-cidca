import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import {
  getCursoById,
  getCursoByUuid,
  getModulosByCurso,
} from "@/repository/aula.repository";
import { ArrowLeft } from "lucide-react";

export default async function AulaCursoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cursoId = Number(id);
  const curso = Number.isNaN(cursoId)
    ? await getCursoByUuid(id)
    : await getCursoById(cursoId);
  if (!curso) {
    notFound();
  }

  const modulos = await getModulosByCurso(curso.cur_id_int);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{curso.cur_nomb_vac}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-200">
            Selecciona un modulo para continuar.
          </p>
        </div>
        <Link href="/aula/cursos">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      {curso.cur_url_vac && (
        <div className="rounded-lg overflow-hidden">
          <img
            src={curso.cur_url_vac}
            alt={curso.cur_nomb_vac}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map((modulo) => (
          <Card
            key={modulo.mod_id_int}
            className="p-6 hover:border-accent transition-all duration-200 hover:shadow-lg overflow-hidden group"
          >
            <div className="aspect-video w-full rounded-md bg-gradient-to-br from-accent/20 to-accent/5 mb-4 flex items-center justify-center relative overflow-hidden">
              <BookOpen className="w-12 h-12 text-accent/60 group-hover:text-accent group-hover:scale-110 transition-all" />
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-foreground line-clamp-2">
                  {modulo.mod_nomb_vac || "Módulo"}
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-200 line-clamp-2 [overflow-wrap:anywhere]">
                {modulo.mod_desc_vac || "Sin descripción"}
              </p>
              <Link
                href={`/aula/cursos/${curso.cur_uuid || curso.cur_id_int}/modulos/${modulo.mod_uuid || modulo.mod_id_int}`}
                className="block pt-2"
              >
                <Button
                  className="w-full cursor-pointer bg-accent hover:bg-accent/90 text-white font-semibold"
                  size="sm"
                >
                  Abrir módulo
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
