/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        paper: '#F6F1E5',
        ink: '#173F30',
        pencil: '#C85840',
        white: '#FFFCF3',
        black: '#10251B',
        slate: {
          50: '#F6F1E5', 100: '#EDE9DA', 200: '#D5D3BF', 300: '#BFCABD',
          400: '#8C9F90', 500: '#5B6A60', 600: '#4E695B', 700: '#315543',
          800: '#354E3E', 900: '#243C2D', 950: '#14251D',
        },
        gray: {
          50: '#F6F1E5', 100: '#EDE9DA', 200: '#D5D3BF', 300: '#BFCABD',
          400: '#8C9F90', 500: '#5B6A60', 600: '#4E695B', 700: '#315543',
          800: '#354E3E', 900: '#243C2D', 950: '#14251D',
        },
        emerald: {
          50: '#EDF0DF', 100: '#DAE5CC', 200: '#BED5AF', 300: '#A7CCA5',
          400: '#91BC93', 500: '#4F895D', 600: '#2F6747', 700: '#1F5139',
          800: '#173F30', 900: '#153326', 950: '#102A1E',
        },
        red: {
          50: '#FBEEE3', 100: '#F4DBCB', 200: '#EDC2AB', 300: '#ED9D83',
          400: '#D57B60', 500: '#C85840', 600: '#AD432F', 700: '#913727',
          800: '#743125', 900: '#58291F', 950: '#3A201A',
        },
      },
      fontFamily: { handwriting: ['AlmacenHand'] },
      borderRadius: { xl: '10px', '2xl': '12px', '3xl': '16px' },
    },
  },
  plugins: [],
};
