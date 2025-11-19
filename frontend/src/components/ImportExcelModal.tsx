import { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ImportResult {
  success: number;
  failed: number;
  warnings: string[];
  errors: string[];
}

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportExcelModal({ isOpen, onClose, onSuccess }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validExtensions = ['.xlsx', '.xlsm', '.xls'];
      const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        alert('Tipo de archivo inválido. Solo se aceptan archivos Excel (.xlsx, .xlsm, .xls)');
        return;
      }
      
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validExtensions = ['.xlsx', '.xlsm', '.xls'];
      const fileExtension = droppedFile.name.toLowerCase().slice(droppedFile.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        alert('Tipo de archivo inválido. Solo se aceptan archivos Excel (.xlsx, .xlsm, .xls)');
        return;
      }
      
      setFile(droppedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ImportResult>('/api/import/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      
      if (response.data.success > 0) {
        onSuccess();
      }
    } catch (error: any) {
      setResult({
        success: 0,
        failed: 0,
        warnings: [],
        errors: [error.response?.data?.detail || 'Error al importar el archivo Excel'],
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-3xl shadow-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-success/10 rounded-xl">
              <FileSpreadsheet className="w-6 h-6 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-text-primary">Importar desde Excel</h2>
              <p className="text-sm text-text-muted">Sube tu archivo Excel con transacciones</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-danger/10 rounded-xl transition-colors text-text-secondary hover:text-danger"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <h3 className="font-bold text-text-primary mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              Formato esperado
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              Tu archivo Excel debe contener las siguientes columnas:
            </p>
            <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
              <li><strong>Fecha</strong> (obligatorio): Fecha de la transacción</li>
              <li><strong>Monto</strong> (obligatorio): Cantidad en dólares</li>
              <li><strong>Categoría</strong>: Nombre de la categoría</li>
              <li><strong>Tipo</strong>: "Ingreso" o "Egreso"</li>
              <li><strong>Descripción</strong>: Detalle de la transacción</li>
              <li><strong>Cuenta</strong>: Nombre de la cuenta</li>
            </ul>
          </div>

          {/* File Upload Area */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary rounded-3xl p-12 text-center cursor-pointer transition-all bg-surface-soft hover:bg-primary/5"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-text-primary font-bold mb-1">
                    Arrastra tu archivo Excel aquí
                  </p>
                  <p className="text-sm text-text-muted">
                    o haz clic para seleccionar un archivo
                  </p>
                </div>
                <p className="text-xs text-text-muted bg-surface px-3 py-1 rounded-pill">
                  Formatos soportados: .xlsx, .xlsm, .xls
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xlsm,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-border rounded-2xl p-4 bg-surface">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-success/10 rounded-xl">
                    <FileSpreadsheet className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">{file.name}</p>
                    <p className="text-xs text-text-muted">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-danger/10 text-danger rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              {/* Success */}
              {result.success > 0 && (
                <div className="bg-success/10 border border-success/20 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <p className="font-bold text-success">
                        ¡Importación exitosa!
                      </p>
                      <p className="text-sm text-text-secondary">
                        Se importaron {result.success} transacciones correctamente
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="bg-danger/10 border border-danger/20 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-danger mb-2">Errores</p>
                      <ul className="text-sm text-text-secondary space-y-1">
                        {result.errors.map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-warning mb-2">Advertencias</p>
                      <ul className="text-sm text-text-secondary space-y-1">
                        {result.warnings.map((warning, i) => (
                          <li key={i}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-5 py-2.5 bg-surface border border-border text-text-primary rounded-2xl font-bold hover:bg-surface-soft transition-colors disabled:opacity-50 shadow-sm"
          >
            {result?.success ? 'Cerrar' : 'Cancelar'}
          </button>
          {!result && (
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-6 py-2.5 bg-success text-white rounded-2xl font-bold hover:bg-success-hover transition-colors disabled:opacity-50 flex items-center gap-2 shadow-button"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
