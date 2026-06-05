"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clientRequest } from '@/lib/clientFetch';

export default function ProfilePage() {
  const router = useRouter();
  const { status } = useSession();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (status !== 'authenticated') {
      return;
    }

    let isActive = true;

    async function loadProfile() {
      try {
        const data = await clientRequest('/api/users/me');
        if (!isActive) {
          return;
        }

        setUser(data);
        setFullName(data.full_name || '');
        setAvatar(data.avatar || '');
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message || 'Could not load your profile.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [router, status]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const updated = await clientRequest('/api/users/me', {
        method: 'PUT',
        body: {
          full_name: fullName || null,
          avatar: avatar || null,
        },
      });
      setUser(updated);
      setMessage('Profile updated successfully.');
    } catch (requestError) {
      setError(requestError.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <section className="surface">Loading profile...</section>;
  }

  return (
    <section className="surface">
      <div className="section-header">
        <div>
          <h1 className="section-title">Profile</h1>
          <p className="section-subtitle">Your Google account is synced to the backend user profile.</p>
        </div>
        {user?.avatar ? <img className="avatar" src={user.avatar} alt={user.full_name || user.email} /> : null}
      </div>

      <form className="form-grid" onSubmit={handleSave}>
        <div className="field">
          <label>Email</label>
          <div className="chip">{user?.email}</div>
        </div>

        <div className="split">
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              className="input"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="field">
            <label htmlFor="avatar">Avatar URL</label>
            <input
              id="avatar"
              className="input"
              value={avatar}
              onChange={(event) => setAvatar(event.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {error ? <div className="alert">{error}</div> : null}
        {message ? <div className="empty-state">{message}</div> : null}

        <button type="submit" className="button button-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </section>
  );
}
