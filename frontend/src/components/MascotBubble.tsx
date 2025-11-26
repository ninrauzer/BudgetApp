import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import type { MascotMood } from '@/types/mascot';

interface MascotBubbleProps {
  message: string;
  mood?: MascotMood;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

// Mapeo de moods a imágenes y colores
const MOOD_CONFIG: Record<
  MascotMood,
  {
    image: string;
    gradient: string;
    accentColor: string;
    icon: string;
  }
> = {
  default: {
    image: '/wolfi.png',
    gradient: 'from-indigo-500 to-purple-600',
    accentColor: 'text-indigo-200',
    icon: '💡',
  },
  happy: {
    image: '/wolfi-happy.png',
    gradient: 'from-emerald-500 to-teal-600',
    accentColor: 'text-emerald-200',
    icon: '😄',
  },
  sad: {
    image: '/wolfi-sad.png',
    gradient: 'from-blue-500 to-cyan-600',
    accentColor: 'text-blue-200',
    icon: '😔',
  },
  angry: {
    image: '/wolfi-angry.png',
    gradient: 'from-red-500 to-rose-600',
    accentColor: 'text-red-200',
    icon: '😠',
  },
  thinking: {
    image: '/wolfi-thinking.png',
    gradient: 'from-amber-500 to-orange-600',
    accentColor: 'text-amber-200',
    icon: '🤔',
  },
  alert: {
    image: '/wolfi-alert.png',
    gradient: 'from-orange-500 to-red-600',
    accentColor: 'text-orange-200',
    icon: '⚠️',
  },
};

export default function MascotBubble({
  message,
  mood = 'default',
  onClose,
  autoClose = true,
  autoCloseDelay = 8000,
}: MascotBubbleProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const config = MOOD_CONFIG[mood];

  // Función para reproducir sonido de typing
  const playTypingSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      // Frecuencia según el mood
      const frequencies: Record<MascotMood, number> = {
        default: 800,
        happy: 900,
        sad: 600,
        angry: 950,
        thinking: 750,
        alert: 1100,
      };

      oscillator.frequency.value = frequencies[mood] || 800;
      oscillator.type = 'sine';

      // Volumen bajo (0.05 es muy suave)
      gain.gain.setValueAtTime(0.05, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.08
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.08);
    } catch {
      // Si Web Audio API no está disponible, simplemente no reproducir sonido
      console.debug('Audio context not available');
    }
  }, [mood]);

  // Animación de typing
  useEffect(() => {
    if (displayedText.length < message.length) {
      const timer = setTimeout(() => {
        // Reproducir sonido solo si no es espacio en blanco
        const nextChar = message[displayedText.length];
        if (nextChar && nextChar.trim() !== '') {
          playTypingSound();
        }
        setDisplayedText(message.slice(0, displayedText.length + 1));
      }, 50); // Velocidad de typing: 50ms por carácter

      return () => clearTimeout(timer);
    }
  }, [displayedText, message, playTypingSound]);

  // Marcar como completo cuando termine el typing
  useEffect(() => {
    if (displayedText.length === message.length && !isComplete) {
      setIsComplete(true);
    }
  }, [displayedText, message.length, isComplete]);

  // Auto-close después de que termine el typing
  useEffect(() => {
    if (autoClose && isComplete) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isComplete, autoClose, autoCloseDelay, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-slideUp">
      {/* Burbuja con mensaje y mascota */}
      <div className="relative">
        {/* Burbuja de chat */}
        <div
          className={`bg-gradient-to-br ${config.gradient} rounded-3xl px-6 py-4 shadow-xl text-white relative`}
        >
          {/* Punta de flecha */}
          <div
            className={`absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-br ${config.gradient} rounded-full`}
          ></div>

          {/* Layout: Wolfi + Contenido */}
          <div className="flex gap-4 items-start">
            {/* Mascota - Wolfi (izquierda) */}
            <div className="flex-shrink-0 w-20 h-20 -mt-2">
              <img
                src={config.image}
                alt={`Wolfi - ${mood}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Contenido derecha */}
            <div className="flex-1">
              {/* Header con botón cerrar */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <p
                  className={`text-xs font-bold uppercase tracking-widest ${config.accentColor}`}
                >
                  {config.icon} Consejo del Lobo
                </p>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
                    aria-label="Cerrar consejo"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Texto con animación de typing */}
              <p className="text-sm leading-relaxed min-h-[2.5rem] font-medium">
                {displayedText}
                {!isComplete && (
                  <span className="inline-block w-1.5 h-5 ml-1 bg-white/80 rounded-sm animate-pulse"></span>
                )}
              </p>

              {/* Indicador de completado */}
              {isComplete && (
                <div className="mt-3 flex items-center gap-1 text-xs text-white/60">
                  <span className="text-base">✨</span>
                  <span>Consejo completado</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decoración: Sombra suave */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.gradient}/20 to-transparent rounded-3xl blur-xl -z-10`}
        ></div>
      </div>

      {/* Animación CSS */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
