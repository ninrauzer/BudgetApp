import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CategoryIconProps {
  iconName?: string;
  className?: string;
  size?: number;
}

export default function CategoryIcon({ iconName, className = '', size = 16 }: CategoryIconProps) {
  // Default icon if none specified
  if (!iconName) {
    return <Icons.Tag className={className} size={size} />;
  }

  // Convert icon name to PascalCase if needed (e.g., "credit-card" -> "CreditCard")
  const pascalCase = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Get the icon component from lucide-react
  const IconComponent = (Icons as any)[pascalCase] as LucideIcon;

  // If icon not found, use default
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in lucide-react`);
    return <Icons.Tag className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
}
