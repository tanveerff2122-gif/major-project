import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AppProvider } from './context/AppContext';

export const metadata: Metadata = {
  title: 'Study & Health Management',
  description: 'A professional SPA for managing study and health',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="transition-colors duration-300 min-h-screen">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
