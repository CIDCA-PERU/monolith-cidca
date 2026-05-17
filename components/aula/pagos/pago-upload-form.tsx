"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, ExternalLink, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VoucherDropzone } from "./voucher-dropzone";
import { uploadVoucher } from "@/actions/pago.actions";
import { toast } from "sonner";

export function PagoUploadForm({
  pagoId,
  currentUrl,
  pagoEstado,
}: {
  pagoId: number;
  currentUrl: string | null;
  pagoEstado?: string | null;
}) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showChangeOption, setShowChangeOption] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Verificar si puede editar
  const canEdit = pagoEstado !== 'PAGADO' && pagoEstado !== 'ACEPTADO';

  // Detectar si es primer envío o cambio
  const isPrimerEnvio = !currentUrl || !showChangeOption;
  const isActualizacion = currentUrl && showChangeOption;

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileRemoved = () => {
    setSelectedFile(null);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile!);
      formData.append("pagoId", pagoId.toString());

      const result = (await uploadVoucher(formData)) as {
        success: boolean;
        message?: string;
        url?: string;
        error?: string;
      };

      if (result.success) {
        toast.success(result.message || "Comprobante actualizado exitosamente");
        setSelectedFile(null);
        setShowChangeOption(false);
        
        // Simular actualización visual
        setIsRefreshing(true);
        setTimeout(() => {
          setIsRefreshing(false);
          router.refresh();
        }, 800);
      } else {
        toast.error(result.error || "Error al enviar");
      }
    } catch (error) {
      toast.error("Ocurrió un error de conexión");
    } finally {
      setIsUploading(false);
    }
  };

  // Si hay URL actual y NO se está cambiando, mostrar imagen
  if (currentUrl && !showChangeOption && !selectedFile) {
    return (
      <Card className={`p-6 space-y-4 transition-opacity duration-500 ${isRefreshing ? 'opacity-60' : ''}`}>
        <h2 className="text-lg font-semibold">Comprobante Enviado</h2>

        {/* Skeleton loader mientras se refresca */}
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Actualizando imagen...</p>
            </div>
          </div>
        )}

        {/* Imagen presentada bonito */}
        <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
          <img
            src={currentUrl}
            alt="Comprobante enviado"
            className="w-full h-auto object-cover max-h-96"
          />
        </div>

        {/* Botones de acciones */}
        <div className="space-y-2">
          <Button
            onClick={() => window.open(currentUrl, "_blank")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver en otra pestaña
          </Button>

          {canEdit && (
            <Button
              onClick={() => setShowChangeOption(true)}
              variant="outline"
              className="w-full hover:text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Corregir comprobante
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Si está en modo cambio o hay nuevo archivo seleccionado
  return (
    <>
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          {showChangeOption ? "Seleccionar nuevo comprobante" : "Adjuntar Comprobante"}
        </h2>

        {/* Area de drag/drop */}
        <VoucherDropzone
          onFileSelected={handleFileSelected}
          onFileRemoved={handleFileRemoved}
          selectedFile={selectedFile}
          isDisabled={isUploading}
        />

        {/* Botones de acción */}
        <div className="space-y-2">
          {selectedFile && (
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={isUploading}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-10 font-semibold disabled:bg-green-600"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...
                </>
              ) : (
                <>Enviar Comprobante</>
              )}
            </Button>
          )}

          {showChangeOption && (
            <Button
              onClick={() => {
                setShowChangeOption(false);
                setSelectedFile(null);
              }}
              variant="outline"
              className="w-full hover:text-white"
              disabled={isUploading}
            >
              Cancelar cambio
            </Button>
          )}
        </div>

        {!selectedFile && !currentUrl && (
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg mt-4">
            <p>
              📄 Sube tu recibo de pago (JPG o PNG) para procesar tu orden.
              Máximo 5MB.
            </p>
          </div>
        )}
      </Card>

      {/* Dialog de confirmación */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                {isActualizacion ? (
                  <>
                    <AlertDialogTitle>Confirmar cambio de comprobante</AlertDialogTitle>
                    <AlertDialogDescription className="mt-2">
                      ¿Estás seguro de que deseas reemplazar el comprobante anterior? Podrás actualizarlo nuevamente si es necesario.
                    </AlertDialogDescription>
                  </>
                ) : (
                  <>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription className="mt-2">
                      Vas a enviar este comprobante de pago. Después podrás actualizarlo si es necesario hasta ANTES de que sea verificado.
                    </AlertDialogDescription>
                  </>
                )}
              </div>
            </div>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} className="bg-green-600 hover:bg-green-700">
              {isActualizacion ? 'Confirmar cambio' : 'Enviar comprobante'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
