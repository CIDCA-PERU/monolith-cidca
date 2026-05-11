"use client";

import { useState } from "react";
import { loginAction } from "@/actions/auth.actions";
import { UserSessionDto } from "@/dto/auth.dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function LoginForm({
  onSuccess,
}: {
  onSuccess?: (user: UserSessionDto) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginAction({
        email,
        password,
      });

      if (response.success && response.user) {
        onSuccess?.(response.user);
      } else {
        setError(response.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        <Card className="border-white/10 bg-black/50 backdrop-blur-md shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">
              CIDCA
            </CardTitle>
            <CardDescription className="text-center text-white">
              Sistema de Gestión de Aprendizaje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-black/30 border-white/20 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white">Contraseña</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="bg-black/30 border-white/20 text-white"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-black"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 text-white" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <a href="#" className="text-accent hover:underline">
                Regístrate
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}