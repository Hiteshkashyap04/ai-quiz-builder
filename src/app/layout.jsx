import Providers from './providers';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata = {
  title: { default: 'AI Quiz Builder', template: '%s | AI Quiz Builder' },
  description: 'Generate AI-powered quizzes, track your scores, and manage your learning — all in one Next.js app.',
  keywords: ['quiz', 'AI', 'learning', 'Mistral', 'Next.js'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-shell">
            <Navbar />
            <main className="app-main">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
