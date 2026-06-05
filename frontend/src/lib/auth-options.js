import crypto from 'crypto';
import GoogleProvider from 'next-auth/providers/google';
import { backendRequest } from './backend';

function deriveGooglePassword(googleId) {
  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret';
  return crypto.createHash('sha256').update(`${googleId}:${secret}`).digest('hex');
}

async function syncGoogleUser(profile) {
  const email = profile?.email;
  const googleId = profile?.sub || profile?.id || email;

  if (!email || !googleId) {
    throw new Error('Google profile did not include an email address.');
  }

  const password = deriveGooglePassword(googleId);
  const payload = { email, password };

  let accessToken = null;

  try {
    const registered = await backendRequest('/auth/register', {
      method: 'POST',
      body: payload,
    });
    accessToken = registered.access_token;
  } catch (error) {
    try {
      const loggedIn = await backendRequest('/auth/login', {
        method: 'POST',
        body: payload,
      });
      accessToken = loggedIn.access_token;
    } catch (loginError) {
      throw loginError;
    }
  }

  if (!accessToken) {
    throw new Error('Unable to create a backend session for this Google account.');
  }

  try {
    await backendRequest('/users/me', {
      method: 'PUT',
      token: accessToken,
      body: {
        full_name: profile?.name || email,
        avatar: profile?.picture || null,
      },
    });
  } catch {
    // Profile sync is best-effort.
  }

  return {
    accessToken,
    email,
    name: profile?.name || email,
    image: profile?.picture || null,
  };
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google' && profile) {
        const syncedUser = await syncGoogleUser(profile);
        token.backendAccessToken = syncedUser.accessToken;
        token.email = syncedUser.email;
        token.name = syncedUser.name;
        token.picture = syncedUser.image;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        email: token.email || session.user?.email,
        name: token.name || session.user?.name,
        image: token.picture || session.user?.image,
      };
      session.backendAccessToken = token.backendAccessToken;
      return session;
    },
  },
};
