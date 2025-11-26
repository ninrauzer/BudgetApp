// SVG Illustration del lobo en modo ejecutivo
// Este es un placeholder visual mientras obtenemos la imagen PNG real

export function MascotSVG() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      {/* Fondo cabeza */}
      <circle cx="48" cy="40" r="30" fill="#4A5A7A" />

      {/* Orejas */}
      <path d="M 30 20 Q 25 10 28 5 Q 32 8 32 18 Z" fill="#4A5A7A" />
      <path d="M 66 20 Q 71 10 68 5 Q 64 8 64 18 Z" fill="#4A5A7A" />

      {/* Interior orejas (blanco) */}
      <path d="M 31 18 Q 28 12 29 8" stroke="#F5E6D3" strokeWidth="3" fill="none" />
      <path d="M 65 18 Q 68 12 67 8" stroke="#F5E6D3" strokeWidth="3" fill="none" />

      {/* Hocico blanco */}
      <ellipse cx="48" cy="50" rx="20" ry="16" fill="#F5E6D3" />

      {/* Ojos grandes */}
      <circle cx="40" cy="35" r="6" fill="#1A1A1A" />
      <circle cx="56" cy="35" r="6" fill="#1A1A1A" />

      {/* Brillo en ojos */}
      <circle cx="41.5" cy="33.5" r="2" fill="white" />
      <circle cx="57.5" cy="33.5" r="2" fill="white" />

      {/* Nariz */}
      <circle cx="48" cy="48" r="4" fill="#1A1A1A" />

      {/* Boca */}
      <path d="M 48 48 Q 44 52 40 51" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
      <path d="M 48 48 Q 52 52 56 51" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />

      {/* Cuerpo con traje */}
      <rect x="28" y="60" width="40" height="25" rx="8" fill="#2C3A52" />

      {/* Solapa izquierda del traje */}
      <polygon points="28,60 20,70 28,80" fill="#1E2A3A" />
      {/* Solapa derecha del traje */}
      <polygon points="68,60 76,70 68,80" fill="#1E2A3A" />

      {/* Corbata roja */}
      <polygon points="48,65 45,75 51,75" fill="#D32F2F" />

      {/* Botones del traje */}
      <circle cx="48" cy="70" r="2" fill="#8B4513" />
      <circle cx="48" cy="78" r="2" fill="#8B4513" />

      {/* Pecho (más claro) */}
      <rect x="38" y="65" width="20" height="12" fill="#E8D4C0" rx="2" />

      {/* Cola (asomando) */}
      <path d="M 72 70 Q 85 65 88 80" stroke="#4A5A7A" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
