// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import { SocketProvider } from '../lib/socket-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Bingo Game - Multiplayer Fun',
  description: 'Play multiplayer bingo with friends online',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
