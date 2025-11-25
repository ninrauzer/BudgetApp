import React from 'react';
import { View, Text } from 'react-native';

// Mapeo de emojis para los iconos más comunes de Lucide
const ICON_EMOJI_MAP: Record<string, string> = {
  // Personal Care
  'pill': '💊',
  'heart': '❤️',
  'thermometer': '🌡️',
  
  // Sports & Fitness
  'dumbbell': '🏋️',
  'bike': '🚴',
  'activity': '🏃',
  
  // Food & Dining
  'utensils': '🍴',
  'coffee': '☕',
  'pizza': '🍕',
  'ice-cream': '🍦',
  'wine': '🍷',
  
  // Home & Living
  'home': '🏠',
  'wrench': '🔧',
  'lightbulb': '💡',
  'sofa': '🛋️',
  
  // Work & Business
  'briefcase': '💼',
  'calculator': '🧮',
  'laptop': '💻',
  
  // Education
  'graduation-cap': '🎓',
  'book': '📚',
  'pencil': '✏️',
  
  // Entertainment
  'film': '🎬',
  'music': '🎵',
  'gamepad': '🎮',
  'tv': '📺',
  
  // Shopping
  'shopping-cart': '🛒',
  'shopping-bag': '🛍️',
  'credit-card': '💳',
  'gift': '🎁',
  
  // Nature & Garden
  'flower': '🌸',
  'tree': '🌳',
  'leaf': '🍃',
  
  // Pets
  'paw-print': '🐾',
  'dog': '🐕',
  'cat': '🐈',
  
  // Travel
  'plane': '✈️',
  'car': '🚗',
  'bus': '🚌',
  'ship': '🚢',
  'luggage': '🧳',
  
  // Health
  'stethoscope': '🩺',
  'syringe': '💉',
  'pill-bottle': '💊',
  
  // Finance
  'piggy-bank': '🐷',
  'coins': '🪙',
  'banknote': '💵',
  'wallet': '👛',
  'chart-line': '📈',
  'trending-up': '📈',
  'trending-down': '📉',
  
  // Communication
  'phone': '📱',
  'mail': '✉️',
  'message': '💬',
  
  // Utilities
  'zap': '⚡',
  'droplet': '💧',
  'flame': '🔥',
  'plug': '🔌',
  
  // Transportation
  'fuel': '⛽',
  'parking': '🅿️',
  
  // Default
  'circle': '⭕',
  'help-circle': '❓',
};

interface CategoryIconProps {
  iconName?: string;
  size?: number;
}

export default function CategoryIcon({ iconName = 'circle', size = 24 }: CategoryIconProps) {
  const emoji = ICON_EMOJI_MAP[iconName] || ICON_EMOJI_MAP['circle'];
  
  return (
    <Text style={{ fontSize: size }}>
      {emoji}
    </Text>
  );
}
