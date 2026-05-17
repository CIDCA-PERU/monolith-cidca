import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/actions/auth.actions";
import {
  getCursosByEstudiante,
  getEstudianteByUserId,
} from "@/repository/aula.repository";

const CIDCA_TIMEZONE = "America/Lima";

function getPrimerNombre(nombre?: string | null): string {
  if (!nombre) {
    return "Estudiante";
  }

  return nombre.trim().split(/\s+/)[0] || "Estudiante";
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDateHeading(date: Date): string {
  const formatter = new Intl.DateTimeFormat("es-PE", {
    timeZone: CIDCA_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const parts = formatter.formatToParts(date);
  const weekday = capitalize(
    parts.find((part) => part.type === "weekday")?.value || "",
  );
  const day = parts.find((part) => part.type === "day")?.value || "";
  const month = capitalize(
    parts.find((part) => part.type === "month")?.value || "",
  );
  const year = parts.find((part) => part.type === "year")?.value || "";

  return `${weekday}, ${day} de ${month} ${year}`;
}

export default async function AulaCursosPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const estudiante = await getEstudianteByUserId(user.usr_id_int);
  const cursos = estudiante
    ? await getCursosByEstudiante(estudiante.estu_id_int)
    : [];
  const primerNombre = getPrimerNombre(
    estudiante?.estu_nomb_vac || user.usr_nomb_vac,
  );
  const fechaActual = formatDateHeading(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium mb-3">
            <span className="text-yellow-600 dark:text-yellow-500">
              ¡Hola de nuevo, {primerNombre}!
            </span>
            <span className="hidden sm:inline-block text-slate-400 dark:text-slate-500">•</span>
            <span className="hidden sm:inline-block text-slate-600 dark:text-slate-300">
              {fechaActual}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Mis Cursos
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-200 max-w-xl">
            Accede a tus cursos activos, revisa tus módulos y continúa con tu
            aprendizaje donde lo dejaste.
          </p>
        </div>

        {/* Espacio reservado para acciones */}
        <div className="shrink-0">{/* <Button variant="outline" ... /> */}</div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <Card
            key={curso.cur_id_int}
            className="p-0 flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
          >
            <div className="relative w-full aspect-[16/9] bg-white flex items-center justify-center shrink-0">
              {curso.cur_url_vac ? (
                <img
                  src={curso.cur_url_vac}
                  alt={curso.cur_nomb_vac}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-slate-400">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Sin imagen</span>
                </div>
              )}
            </div>

            <div className="relative p-5 flex flex-col flex-1 bg-transparent">
              <div className="absolute left-0 top-0 h-1.5 w-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-br shadow-md z-10"></div>
              
              <div className="space-y-2 flex-1 mb-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                  {curso.cur_nomb_vac}
                </h3>
                <p className="text-sm text-slate-600 dark:text-white line-clamp-2 transition-colors duration-200">
                  {curso.cur_desc_vac || "Descripción no disponible"}
                </p>
              </div>

              <Link
                href={`/aula/cursos/${curso.cur_uuid || curso.cur_id_int}`}
                className="mt-auto block"
              >
                <Button
                  className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all duration-200 gap-2"
                  size="sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Ver curso
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
