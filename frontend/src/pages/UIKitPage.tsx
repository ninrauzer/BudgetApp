import { useState } from 'react';
import MascotBubble from '@/components/MascotBubble';
import type { MascotMood } from '@/types/mascot';
import { RotateCcw } from 'lucide-react';

const TIPS = [
  "Dicen que el dinero no compra la felicidad, ¡pero compra comida! ¿Alguien tiene algo extra para este lobo 'minimalista'?",
  "El 93% de tu crédito está usado. No es un número, es una llamada de auxilio. 📢",
  "Revolvente = lo que gastas mes a mes. Cuotas = lo que prometes pagar en marzo. Ambas duelen. 🤕",
  "Pagar el mínimo es como seguir un régimen comiendo solo postre. Suena bien, pero acaba mal.",
  "S/ 661 de crédito disponible. Eso es menos que una pizza grande. Piénsalo dos veces.",
  "Las cuotas automáticas no desaparecen solas. Ellas vienen por ti en marzo. 👻",
  "Tu revolvente debe bajar cada mes. Si no baja, estás remando en círculos. 🚣",
  "El dinero es como el tiempo: nunca sabes cuánto tienes hasta que se acaba.",
];

const MOODS: { mood: MascotMood; label: string; description: string }[] = [
  { mood: 'default', label: '💡 Default', description: 'Consejo neutral' },
  { mood: 'happy', label: '😄 Happy', description: 'Buenas noticias' },
  { mood: 'sad', label: '😔 Sad', description: 'Situación difícil' },
  { mood: 'angry', label: '😠 Angry', description: 'Advertencia fuerte' },
  { mood: 'thinking', label: '🤔 Thinking', description: 'Reflexión' },
  { mood: 'alert', label: '⚠️ Alert', description: 'Alerta importante' },
];

export default function UIKitPage() {
  const [visibleBubble, setVisibleBubble] = useState<{ tipIndex: number; mood: MascotMood } | null>(null);

  const showTip = (tipIndex: number, mood: MascotMood = 'default') => {
    setVisibleBubble({ tipIndex, mood });
  };

  const closeBubble = () => {
    setVisibleBubble(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">UI Kit</h1>
          <p className="text-slate-400">
            Componentes reutilizables para BudgetApp
          </p>
        </div>

        {/* Sección: MascotBubble */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              🐺 MascotBubble Component
            </h2>
            <p className="text-slate-400">
              Mascota interactiva con múltiples moods y animación de escritura
            </p>
          </div>

          {/* Selector de Moods */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Elige un mood:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MOODS.map(({ mood, label, description }) => (
                <button
                  key={mood}
                  onClick={() => showTip(0, mood)}
                  className={`p-3 rounded-lg text-left transition-all text-sm ${
                    visibleBubble?.mood === mood
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <p className="font-bold">{label}</p>
                  <p className="text-xs opacity-70">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Grid de botones para probar tips */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Tips por mood:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {TIPS.map((tip, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-xs font-bold text-slate-300">Tip {index + 1}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {MOODS.slice(0, 3).map(({ mood }) => (
                      <button
                        key={`${index}-${mood}`}
                        onClick={() => showTip(index, mood)}
                        className={`p-2 rounded text-xs transition-all ${
                          visibleBubble?.tipIndex === index && visibleBubble?.mood === mood
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {MOODS.find(m => m.mood === mood)?.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón para cerrar */}
          {visibleBubble && (
            <button
              onClick={closeBubble}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
            >
              <RotateCcw size={16} />
              Cerrar burbuja
            </button>
          )}

          {/* Preview */}
          <div className="mt-8 p-6 bg-slate-900/50 rounded-lg border border-slate-700 min-h-40">
            <p className="text-slate-500 text-sm mb-4">Preview:</p>
            <div className="relative h-32">
              {visibleBubble && (
                <MascotBubble
                  message={TIPS[visibleBubble.tipIndex]}
                  mood={visibleBubble.mood}
                  onClose={closeBubble}
                  autoClose={false}
                />
              )}
              {!visibleBubble && (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <p>Selecciona un mood y un tip arriba para ver la preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documentación */}
        <div className="mt-12 bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Documentación</h3>
          <div className="space-y-4 text-slate-400">
            <div>
              <p className="font-mono text-sm bg-slate-900 p-3 rounded text-emerald-400">
                &lt;MascotBubble message="..." mood="happy" onClose=&#123;() =&gt; &#123;&#125;&#125; /&gt;
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2">Props:</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-indigo-400">message</span>
                  <span className="text-slate-500"> (string) - </span>
                  Texto del consejo
                </li>
                <li>
                  <span className="text-indigo-400">mood</span>
                  <span className="text-slate-500"> (MascotMood) - </span>
                  'default' | 'happy' | 'sad' | 'angry' | 'thinking' | 'alert' | 'confused'
                </li>
                <li>
                  <span className="text-indigo-400">onClose</span>
                  <span className="text-slate-500"> (function) - </span>
                  Callback al cerrar
                </li>
                <li>
                  <span className="text-indigo-400">autoClose</span>
                  <span className="text-slate-500"> (boolean) - </span>
                  Auto-cerrar después de terminar (default: true)
                </li>
                <li>
                  <span className="text-indigo-400">autoCloseDelay</span>
                  <span className="text-slate-500"> (number) - </span>
                  Delay en ms (default: 8000)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2">Moods disponibles:</h4>
              <ul className="space-y-1 text-sm list-disc list-inside">
                <li>💡 <span className="text-indigo-400">default</span> - Consejo neutral (morado)</li>
                <li>😄 <span className="text-emerald-400">happy</span> - Buenas noticias (verde)</li>
                <li>😔 <span className="text-blue-400">sad</span> - Situación difícil (azul)</li>
                <li>😠 <span className="text-red-400">angry</span> - Advertencia fuerte (rojo)</li>
                <li>🤔 <span className="text-amber-400">thinking</span> - Reflexión (naranja)</li>
                <li>⚠️ <span className="text-orange-400">alert</span> - Alerta importante (naranja oscuro)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2">Características:</h4>
              <ul className="space-y-1 text-sm list-disc list-inside">
                <li>✨ Animación de escritura configurable</li>
                <li>🎨 Diseño glass-morphism con gradiente dinámico</li>
                <li>� Múltiples emociones (moods) con imágenes diferentes</li>
                <li>🎯 Auto-close después de completar texto</li>
                <li>📱 Responsive design (esquina inferior derecha)</li>
                <li>⌨️ Cursor parpadeante mientras escribe</li>
                <li>🔄 Colores y emojis adaptan al mood</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
