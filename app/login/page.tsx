"use client";

import { LoginForm } from "@/components/auth/login-form";
import { UserSessionDto } from "@/dto/auth.dto";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const handleSuccess = (user: UserSessionDto) => {
    const role = user.rol_nam_vc?.toUpperCase();
    if (role === "ESTUDIANTE") {
      router.push("/aula/cursos");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="w-full px-4 flex flex-col items-center gap-4">
      {justRegistered && (
        <div className="w-full max-w-md flex items-center gap-3 px-4 py-3 rounded-xl bg-green-900/40 border border-green-500/30 text-green-300">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            ¡Cuenta creada exitosamente! Inicia sesión para continuar.
          </p>
        </div>
      )}
      <LoginForm onSuccess={handleSuccess} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <Suspense fallback={null}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
