import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: { params: { scope: 'openid email profile' } },
    }),
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        await prisma.user.upsert({
          where: { email: profile.email },
          create: { email: profile.email, name: profile.name, image: profile.picture },
          update: { name: profile.name, image: profile.picture },
        });
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: profile.email } });
        if (dbUser) token.sub = dbUser.id;
        token.picture = profile.picture;
        token.name = profile.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub,
        name: token.name || session.user?.name,
        image: token.picture || session.user?.image,
      };
      return session;
    },
  },
};
