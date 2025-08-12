/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // Add this if you're using src directory
  ],
  theme: {
    extend: {
      colors: {
        // ShadCN-style HSL color tokens
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: 'hsl(var(--destructive))',
        muted: 'hsl(var(--muted))',
        accent: 'hsl(var(--accent))',
        popover: 'hsl(var(--popover))',
        card: 'hsl(var(--card))',
        border: 'hsl(var(--border))', // ✅ Added this so border-border works
      },
      borderColor: {
        input: 'hsl(var(--input))',
      },
    },
  },
};
