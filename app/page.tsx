import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Bienvenido a CIDCA
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sistema de Gestión de Aprendizaje Profesional
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Comenzar
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card border-t border-border py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-12">Características</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-accent">Cursos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gestiona y organiza cursos con módulos, apartados y contenido multimedia.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-accent">Exámenes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sistema anti-trampas con monitoreo de infracciones y calificación automática.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-accent">Asistencia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Control de asistencia con validación horaria y reportes detallados.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2026 CIDCA - Sistema de Gestión de Aprendizaje</p>
        </div>
      </footer>
    </div>
  );
}
