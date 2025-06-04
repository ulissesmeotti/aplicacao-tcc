export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    // Use direct import instead of require
    import('@tailwindcss/forms'),
  ],
};