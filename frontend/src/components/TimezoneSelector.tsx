import { Globe, Check } from 'lucide-react';
import { useTimezone } from '@/contexts/TimezoneContext';
import { useState } from 'react';

// Common timezones grouped by region
const TIMEZONES = {
  'América': [
    { value: 'America/Lima', label: 'Lima (UTC-5)', offset: 'UTC-5' },
    { value: 'America/New_York', label: 'Nueva York (UTC-5)', offset: 'UTC-5' },
    { value: 'America/Chicago', label: 'Chicago (UTC-6)', offset: 'UTC-6' },
    { value: 'America/Denver', label: 'Denver (UTC-7)', offset: 'UTC-7' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (UTC-8)', offset: 'UTC-8' },
    { value: 'America/Mexico_City', label: 'Ciudad de México (UTC-6)', offset: 'UTC-6' },
    { value: 'America/Bogota', label: 'Bogotá (UTC-5)', offset: 'UTC-5' },
    { value: 'America/Santiago', label: 'Santiago (UTC-3)', offset: 'UTC-3' },
    { value: 'America/Buenos_Aires', label: 'Buenos Aires (UTC-3)', offset: 'UTC-3' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)', offset: 'UTC-3' },
  ],
  'Europa': [
    { value: 'Europe/London', label: 'Londres (UTC+0)', offset: 'UTC+0' },
    { value: 'Europe/Paris', label: 'París (UTC+1)', offset: 'UTC+1' },
    { value: 'Europe/Madrid', label: 'Madrid (UTC+1)', offset: 'UTC+1' },
    { value: 'Europe/Berlin', label: 'Berlín (UTC+1)', offset: 'UTC+1' },
    { value: 'Europe/Rome', label: 'Roma (UTC+1)', offset: 'UTC+1' },
  ],
  'Asia': [
    { value: 'Asia/Tokyo', label: 'Tokio (UTC+9)', offset: 'UTC+9' },
    { value: 'Asia/Shanghai', label: 'Shanghái (UTC+8)', offset: 'UTC+8' },
    { value: 'Asia/Singapore', label: 'Singapur (UTC+8)', offset: 'UTC+8' },
    { value: 'Asia/Dubai', label: 'Dubái (UTC+4)', offset: 'UTC+4' },
  ],
  'Oceanía': [
    { value: 'Australia/Sydney', label: 'Sídney (UTC+10)', offset: 'UTC+10' },
    { value: 'Pacific/Auckland', label: 'Auckland (UTC+12)', offset: 'UTC+12' },
  ]
};

export default function TimezoneSelector() {
  const { timezone, setTimezone } = useTimezone();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentTimezoneInfo = Object.values(TIMEZONES)
    .flat()
    .find(tz => tz.value === timezone);
  
  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    setIsExpanded(false);
    
    // Force a page reload to apply timezone changes everywhere
    // This is the simplest way to ensure all components re-render with new timezone
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="p-4 bg-surface-soft rounded-xl border border-border">
      <div className="flex items-center gap-3 mb-3">
        <Globe className="w-5 h-5 text-primary" strokeWidth={2.5} />
        <h3 className="font-bold text-text-primary">Zona Horaria</h3>
      </div>
      <p className="text-sm text-text-secondary mb-4">
        Define tu zona horaria para asegurar que las fechas se muestren correctamente
      </p>

      {/* Current Timezone Display */}
      <div className="mb-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">Zona horaria actual:</p>
            <p className="font-bold text-text-primary">
              {currentTimezoneInfo?.label || timezone}
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-all"
          >
            {isExpanded ? 'Cerrar' : 'Cambiar'}
          </button>
        </div>
      </div>

      {/* Timezone Selection (Expanded) */}
      {isExpanded && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(TIMEZONES).map(([region, zones]) => (
            <div key={region}>
              <p className="text-xs font-bold text-text-secondary uppercase mb-2 px-2">
                {region}
              </p>
              <div className="space-y-1">
                {zones.map((tz) => (
                  <button
                    key={tz.value}
                    onClick={() => handleTimezoneChange(tz.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                      timezone === tz.value
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface hover:bg-surface-soft border border-border hover:border-primary/30'
                    }`}
                  >
                    <div>
                      <p className={`font-medium ${timezone === tz.value ? 'text-white' : 'text-text-primary'}`}>
                        {tz.label}
                      </p>
                    </div>
                    {timezone === tz.value && (
                      <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-text-secondary mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-600 rounded-lg">
        💡 <strong>Tip:</strong> Si tus fechas aparecen con un día de diferencia, asegúrate de seleccionar tu zona horaria correcta.
      </p>
    </div>
  );
}
