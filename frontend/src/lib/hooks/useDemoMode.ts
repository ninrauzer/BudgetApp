import { useState, useEffect } from 'react';

const DEMO_MODE_KEY = 'budgetapp_demo_mode';
const DEMO_SCALE_FACTOR = 10; // Divide amounts by 10

export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(DEMO_MODE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(DEMO_MODE_KEY, isDemoMode.toString());
  }, [isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };

  const applyDemoScale = (amount: number): number => {
    if (!isDemoMode) return amount;
    return amount / DEMO_SCALE_FACTOR;
  };

  const obfuscateDescription = (description: string, categoryName?: string): string => {
    if (!isDemoMode) return description;
    if (!description) return description; // Safety check for empty descriptions
    
    // Generic descriptions based on category
    const genericDescriptions: Record<string, string[]> = {
      'Alimentación': ['Compra en supermercado', 'Restaurante', 'Delivery de comida'],
      'Transporte': ['Taxi/Uber', 'Combustible', 'Transporte público'],
      'Salud': ['Farmacia', 'Consulta médica', 'Medicamentos'],
      'Entretenimiento': ['Streaming', 'Salida recreativa', 'Evento'],
      'Tecnología': ['Compra tecnología', 'Suscripción digital', 'Software'],
      'Educación': ['Curso online', 'Material educativo', 'Libro'],
      'Servicios': ['Servicio mensual', 'Pago de servicio', 'Suscripción'],
      'Hogar': ['Artículo del hogar', 'Mantenimiento', 'Reparación'],
      'Ropa': ['Compra de ropa', 'Accesorios', 'Calzado'],
      'default': ['Compra', 'Pago', 'Gasto'],
    };

    const category = categoryName?.trim() || 'default';
    const options = genericDescriptions[category] || genericDescriptions.default;
    
    // Use description hash to consistently pick same generic description
    const hash = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % options.length;
    
    return options[index];
  };

  return {
    isDemoMode,
    toggleDemoMode,
    applyDemoScale,
    obfuscateDescription,
  };
}
