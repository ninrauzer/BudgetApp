import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CategoryIconProps {
  iconName?: string;
  className?: string;
  size?: number;
}

// Map of icon names to lucide-react icon names
const iconMap: Record<string, string> = {
  'trending-up': 'TrendingUp',
  'trending-down': 'TrendingDown',
  'pill': 'Pill',
  'dumbell': 'Dumbbell',
  'piggy-bank': 'PiggyBank',
  'utensils': 'Utensils',
  'home': 'Home',
  'wrench': 'Wrench',
  'award': 'Award',
  'calculator': 'Calculator',
  'arrow-left-right': 'ArrowLeftRight',
  'graduation-cap': 'GraduationCap',
  'film': 'Film',
  'shield': 'Shield',
  'coins': 'Coins',
  'gem': 'Gem',
  'paw-print': 'PawPrint',
  'target': 'Target',
  'plane': 'Plane',
  'package': 'Package',
  'credit-card': 'CreditCard',
  'heart': 'Heart',
  'star': 'Star',
  'zap': 'Zap',
  'help-circle': 'HelpCircle',
};

export default function CategoryIcon({ iconName, className = '', size = 16 }: CategoryIconProps) {
  // Default icon if none specified
  if (!iconName) {
    return <Icons.Tag className={className} size={size} strokeWidth={2} />;
  }

  // Try to find icon from map first
  let mappedName = iconMap[iconName.toLowerCase()];
  
  // If not in map, try direct PascalCase conversion
  if (!mappedName) {
    mappedName = iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  // Get the icon component from lucide-react
  const IconComponent = (Icons as any)[mappedName] as LucideIcon;

  // If icon not found, use default and log warning
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" (mapped as "${mappedName}") not found in lucide-react`);
    return <Icons.Tag className={className} size={size} strokeWidth={2} />;
  }

  return <IconComponent className={className} size={size} strokeWidth={2} />;
}
