import Providers from './providers';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata = {
  title: 'AI Quiz Builder',
  description: 'Generate, take, and track quizzes with Google sign-in and AI-powered question creation.',
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
