/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brown-red': 'rgb(81, 55, 55)', // #513737
        'light-gray': 'rgb(112, 112, 112)', // #707070
      },
    },
  },
  plugins: [],
};
