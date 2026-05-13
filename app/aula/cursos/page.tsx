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
  const weekday = capitalize(parts.find((part) => part.type === "weekday")?.value || "");
  const day = parts.find((part) => part.type === "day")?.value || "";
  const month = capitalize(parts.find((part) => part.type === "month")?.value || "");
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
    estudiante?.estu_nomb_vac || user.usr_nomb_vac
  );
  const fechaActual = formatDateHeading(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium mb-3">
            <span className="text-yellow-500">¡Hola de nuevo, {primerNombre}!</span>
            <span className="hidden sm:inline-block text-slate-600">•</span>
            <span className="hidden sm:inline-block text-slate-400">{fechaActual}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Mis Cursos
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Accede a tus cursos activos, revisa tus módulos y continúa con tu
            aprendizaje donde lo dejaste.
          </p>
        </div>

        {/* Espacio reservado para acciones */}
        <div className="shrink-0">{/* <Button variant="outline" ... /> */}</div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <Card key={curso.cur_id_int} className="p-4 overflow-hidden">
            {curso.cur_url_vac ? (
              <img
                src={curso.cur_url_vac}
                alt={curso.cur_nomb_vac}
                className="w-full aspect-[16/9] object-cover rounded-md"
              />
            ) : (
              <div className="aspect-[16/9] rounded-md bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">
                  Sin imagen
                </span>
              </div>
            )}
            <div className="mt-4 space-y-2">
              <h3 className="text-base font-semibold">{curso.cur_nomb_vac}</h3>
              <p className="text-sm text-muted-foreground">
                {curso.cur_desc_vac || ""}
              </p>
              <Link href={`/aula/cursos/${curso.cur_uuid || curso.cur_id_int}`}>
                <Button className="w-full" size="sm">
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
