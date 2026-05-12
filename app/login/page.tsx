"use client";

import { LoginForm } from "@/components/auth/login-form";
import { UserSessionDto } from "@/dto/auth.dto";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = (user: UserSessionDto) => {
    const role = user.rol_nam_vc?.toUpperCase();
    if (role === "ESTUDIANTE") {
      router.push("/aula/cursos");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="w-full px-4 flex justify-center">
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
