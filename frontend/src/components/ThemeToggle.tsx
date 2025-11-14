import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-gray-800/30 dark:bg-gray-800/30 border border-gray-700/50 dark:border-gray-700/50 hover:bg-gray-700/30 dark:hover:bg-gray-700/30 transition-all group"
      title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-blue-500 group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
