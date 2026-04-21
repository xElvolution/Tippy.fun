import type { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

type DiscordProfile = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar: string | null;
  email?: string | null;
};

const clientId = process.env.DISCORD_CLIENT_ID?.trim() ?? '';
const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim() ?? '';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET?.trim(),
  debug: process.env.NEXTAUTH_DEBUG === 'true',
  providers: [
    DiscordProvider({
      clientId,
      clientSecret,
      authorization: { params: { scope: 'identify email guilds' } },
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        const p = profile as DiscordProfile;
        token.name = p.global_name ?? p.username ?? token.name;
        token.picture =
          p.avatar != null
            ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png`
            : (token.picture as string | undefined);
        if (p.email) token.email = p.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
};
