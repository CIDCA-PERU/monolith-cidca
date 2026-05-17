import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth.actions";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/aula/student-sidebar";
import { ThemeInitializer } from "@/components/aula/theme-initializer";

export default async function AulaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.rol_nam_vc && user.rol_nam_vc !== "ESTUDIANTE") {
    redirect("/dashboard");
  }

  return (
    <SidebarProvider>
      <ThemeInitializer modoOscuro={user.usr_mod_bol ?? false} />
      <StudentSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 shadow-md">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Aula Virtual
              </span>
              <span className="text-xs text-slate-800 dark:text-white">
                CIDCA
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3"> 
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {user.usr_email_vac}
            </div>
          </div>
        </header>
        <div className="mx-auto w-full max-w-7xl px-6 py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
