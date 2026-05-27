import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

const appFonts = {
  Roboto: roboto,
};

export { appFonts };
