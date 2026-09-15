import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WISHAM | Buy Exclusive Beats — Global Store',
  description:
    'Buy exclusive and inclusive instrumentals with instant delivery — master WAV, stems and official licenses.',
  icons: { icon: '/favicon.jpg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-white min-h-screen text-neutral-900 antialiased"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}