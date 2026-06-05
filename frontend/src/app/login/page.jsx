"use client";

import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [router, status]);

  return (
    <section className="auth-panel">
      <div className="auth-visual">
        <strong>AI Quiz Builder</strong>
      </div>
      <div className="stack">
        <h1 className="page-title">Sign in with Google</h1>
        <p className="muted">
          Google login creates or reuses your backend account automatically so the quiz and score API keeps working.
        </p>
        <button type="button" className="button button-primary" onClick={() => signIn('google', { callbackUrl: '/' })}>
          Continue with Google
        </button>
      </div>
    </section>
  );
}
