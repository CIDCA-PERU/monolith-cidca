'use client';

import { useCallback, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoucherDropzoneProps {
  onFileSelected: (file: File) => void;
  onFileRemoved: () => void;
  selectedFile?: File | null;
  isDisabled?: boolean;
}

export function VoucherDropzone({
  onFileSelected,
  onFileRemoved,
  selectedFile,
  isDisabled,
}: VoucherDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Generar preview URL cuando hay archivo seleccionado
  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  // Función interna para validar el archivo antes de pasarlo al padre
  const validateAndSelect = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Solo se permiten imágenes (JPG, PNG).');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe exceder los 5MB.');
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      e.preventDefault();
      setIsDragging(true);
    },
    [isDisabled]
  );

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        validateAndSelect(files[0]);
      }
    },
    [isDisabled, onFileSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      if (files && files.length > 0) {
        validateAndSelect(files[0]);
      }
    },
    [onFileSelected]
  );

  const handleClick = () => {
    document.getElementById('voucher-input')?.click();
  };

  return (
    <div className={`space-y-4 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {!selectedFile ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-accent bg-accent/10 scale-105'
              : 'border-muted-foreground/30 hover:border-accent hover:bg-accent/5'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-accent/10 rounded-full">
              <Upload className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold">Arrastra tu foto del comprobante aquí</p>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-2">
                o haz clic para seleccionar
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 font-medium">
                Solo imágenes JPG o PNG (máx. 5MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {previewUrl && (
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-full h-auto object-cover max-h-64"
              />
            </div>
          )}
          
          <Card className="p-4 space-y-3 bg-green-50 border-green-200">
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-blue-100 rounded">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onFileRemoved}
                disabled={isDisabled}
                className="flex-shrink-0 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-green-700 font-medium">✓ Imagen lista para enviar</p>
          </Card>
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg, image/png"
        onChange={handleFileInput}
        className="hidden"
        id="voucher-input"
        disabled={isDisabled}
      />
    </div>
  );
}