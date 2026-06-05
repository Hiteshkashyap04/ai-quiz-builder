"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/generate', label: 'Generate' },
  { href: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const initials = session?.user?.name
    ? session.user.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
    : 'AQ';

  return (
    <header className="topbar">
      <Link href="/" className="brand" aria-label="AI Quiz Builder home">
        <span className="brand-mark">
          {session?.user?.image ? (
            <Image src={session.user.image} alt={initials} width={36} height={36} />
          ) : (
            initials
          )}
        </span>
        <span className="brand-text">
          AI Quiz Builder
          <small>Powered by Mistral</small>
        </span>
      </Link>

      <nav className="topbar-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${pathname === item.href ? 'is-active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="topbar-actions">
        {status === 'loading' ? (
          <span className="chip">Loading...</span>
        ) : status === 'authenticated' ? (
          <>
            <span className="chip" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-flex' }}>
              {session.user?.email}
            </span>
            <button
              type="button"
              className="button button-ghost button-sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            type="button"
            className="button button-primary button-sm"
            onClick={() => signIn('google', { callbackUrl: '/' })}
          >
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
}
