import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1A1F5E',
        yushan: '#FFE000',
        fubon: '#FF4D1A',
        dbs: '#00E0C8',
        surface: '#F8F8F5',
        ink: '#0D0D0D',
      },
      fontFamily: {
        danfo: ['Purple-Purse', 'serif'],
        sans: ['Noto Sans TC', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
