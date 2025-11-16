/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 亦歌 5 种主题色
        theme: {
          lightblue: {
            bg: '#e8f4f8',
            primary: '#5fb7d4',
            secondary: '#4a9fb8',
            text: '#333',
          },
          red: {
            bg: '#fceaea',
            primary: '#e57373',
            secondary: '#d32f2f',
            text: '#333',
          },
          blue: {
            bg: '#e3f2fd',
            primary: '#42a5f5',
            secondary: '#1976d2',
            text: '#333',
          },
          black: {
            bg: '#1a1a1a',
            primary: '#4a4a4a',
            secondary: '#2a2a2a',
            text: '#f0f0f0',
          },
          google: {
            bg: '#ffffff',
            primary: '#4285f4',
            secondary: '#34a853',
            text: '#333',
          },
        },
      },
    },
  },
  plugins: [],
}
