import React, { useState } from 'react';

interface Props {
  cardId?: number;
}

// Stub inicial hasta implementar ADR-006 (parser IA)
export const StatementUpload: React.FC<Props> = ({ cardId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file || !cardId) return;
    // TODO: Integrar endpoint /credit-cards/{id}/statements/upload cuando esté listo
    setStatus('Simulación de subida (endpoint pendiente)');
    setTimeout(() => setStatus(null), 2500);
  };

  return (
    <div className="bg-white border-2 border-border rounded-xl p-4 shadow-card">
      <p className="text-xs uppercase tracking-wider font-medium text-text-secondary mb-2">Estado de Cuenta</p>
      <input type="file" accept="application/pdf" onChange={handleFile} className="mb-3" />
      <button
        disabled={!file || !cardId}
        onClick={handleUpload}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 font-bold text-sm transition-all disabled:opacity-40"
      >
        Subir PDF
      </button>
      {status && <p className="text-xs mt-2 text-amber-600">{status}</p>}
    </div>
  );
};
