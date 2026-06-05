"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clientRequest } from '@/lib/clientFetch';

function AvatarPreview({ src, name }) {
  const initials = name
    ? name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
    : '?';

  if (src) {
    return (
      <Image
        src={src}
        alt={name || 'Avatar'}
        width={76}
        height={76}
        className="avatar avatar-lg"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }
  return (
    <div className="avatar avatar-lg avatar-placeholder" style={{ borderRadius: '50%' }}>
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { status } = useSession();
  const [user, setUser]         = useState(null);
  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [message, setMessage]   = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return; }
    if (status !== 'authenticated') return;
    let active = true;

    async function load() {
      try {
        const data = await clientRequest('/api/users/me');
        if (!active) return;
        setUser(data);
        setFullName(data.full_name || data.name || '');
        setAvatar(data.avatar || data.image || '');
      } catch (err) {
        if (active) setError(err.message || 'Could not load your profile.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [router, status]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await clientRequest('/api/users/me', {
        method: 'PUT',
        body: { full_name: fullName || null, avatar: avatar || null },
      });
      setUser(updated);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <span className="spinner spinner-lg" />
        Loading profile…
      </div>
    );
  }

  const displayAvatar = avatar || user?.avatar || user?.image;
  const displayName   = fullName || user?.full_name || user?.name;

  return (
    <section className="surface" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">Profile</h1>
          <p className="section-subtitle">Your Google account synced to Prisma.</p>
        </div>
        <AvatarPreview src={displayAvatar} name={displayName} />
      </div>

      <hr className="divider" style={{ margin: '20px 0' }} />

      <form className="form-grid" onSubmit={handleSave}>
        <div className="field">
          <span className="field-label">Email</span>
          <div className="chip" style={{ width: 'fit-content', borderRadius: 10 }}>
            {user?.email}
          </div>
        </div>

        <div className="split">
          <div className="field">
            <label htmlFor="fullName" className="field-label">Full name</label>
            <input
              id="fullName"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="field">
            <label htmlFor="avatar" className="field-label">Avatar URL</label>
            <input
              id="avatar"
              className="input"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>

        {error   ? <div className="alert">{error}</div>       : null}
        {message ? <div className="success-msg">{message}</div> : null}

        <button type="submit" className="button button-primary" disabled={saving}>
          {saving ? <><span className="spinner" /> Saving…</> : 'Save profile'}
        </button>
      </form>
    </section>
  );
}
