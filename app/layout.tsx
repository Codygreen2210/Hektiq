import type { Metadata } from 'next';
import { Sora, Inter } from 'next/font/google';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'Hektiq - Real People. Deeper Discussions.',
  description: 'For everyone building from nothing. Money. Business. Building. One place. No gatekeeping.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={sora.variable + ' ' + inter.variable}>
      <body className='min-h-screen bg-[#080F14] text-white antialiased'>
        {children}
      </body>
    </html>
  );
}