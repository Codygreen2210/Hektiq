import type { Metadata } from 'next';
import { Sora, Inter, Bebas_Neue } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import './theme.css';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const bebas = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'Hektiq - Your corner of the internet',
  description: 'Your corner of the internet, run by the people in it. Outdoors, sports, money, garage, and art communities built by the people who use them.',
};

const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem('hektiq_theme');
    var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'day');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={sora.variable + ' ' + inter.variable + ' ' + bebas.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className='min-h-screen antialiased'>
        {children}
        <Analytics />
      </body>
    </html>
  );
}