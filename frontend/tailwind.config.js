/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }], // 40px
        'h1': ['1.875rem', { lineHeight: '1.3', fontWeight: '700' }],      // 30px
        'h2': ['1.375rem', { lineHeight: '1.4', fontWeight: '600' }],      // 22px
        'h3': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],      // 18px
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],        // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
        'label': ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],  // 13px
        'label-sm': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }], // 12px
      },
      borderRadius: {
        'button': '12px',
        'input': '12px',
        'card': '20px',
        'container': '24px',
        'progress': '12px',
        'tag': '12px',
        'pill': '999px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'sm': '0 2px 4px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'xl': '0 12px 32px rgba(0, 0, 0, 0.16)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'button': '0 2px 6px rgba(0, 0, 0, 0.12)',
      },
      colors: {
        // Core Palette
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        'surface-soft': 'hsl(var(--surface-soft))',
        border: 'hsl(var(--border))',
        
        // Text
        'text-primary': 'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        'text-muted': 'hsl(var(--text-muted))',
        
        // Vibrant accent colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          hover: 'hsl(var(--primary-hover))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          hover: 'hsl(var(--success-hover))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
          hover: 'hsl(var(--danger-hover))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
        },
        
        // Keep original brand colors for compatibility
        'brand-primary': {
          DEFAULT: '#2D60FF',
          soft: '#6AA9FF',
          hover: '#244DCC',
          foreground: '#FFFFFF',
        },
        
        // Financial Colors
        income: {
          DEFAULT: '#00C48C',
          soft: '#00E6A0',
          foreground: '#FFFFFF',
        },
        expense: {
          DEFAULT: '#FF4D67',
          soft: '#FF7088',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#FACC15',
          soft: '#FDE047',
          foreground: '#111827',
        },
        info: {
          DEFAULT: '#0EA5E9',
          soft: '#38BDF8',
          foreground: '#FFFFFF',
        },
        
        // Category Colors
        category: {
          food: '#1E90FF',
          transport: '#00BFA6',
          entertainment: '#A347FF',
          services: '#FFAA00',
          'extra-income': '#009B4D',
        },
        
        // Semantic aliases (for shadcn/ui compatibility)
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
        secondary: {
          DEFAULT: '#F3F6FB',
          foreground: '#111827',
        },
        muted: {
          DEFAULT: '#F3F6FB',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#EEF3FF',
          foreground: '#2D60FF',
        },
        destructive: {
          DEFAULT: '#FF4D67',
          foreground: '#FFFFFF',
        },
        input: '#E5E7EB',
        ring: '#2D60FF',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #2D60FF, #6AA9FF)',
        'gradient-income': 'linear-gradient(135deg, #00C48C, #00E6A0)',
        'gradient-expense': 'linear-gradient(135deg, #FF4D67, #FF7088)',
      },
      maxWidth: {
        'layout': '1400px',
      },
    },
  },
  plugins: [],
}
