import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import jwt from "jsonwebtoken";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },

  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        // Generate a standard signed JWT for FastAPI to read
        const secret = process.env.NEXTAUTH_SECRET || "repo-pilot-super-secret-key";
        
        // Pass the github token and provider into the payload so FastAPI can use it
        const apiToken = jwt.sign({
          ...token,
          github_token: token.accessToken,
          provider: token.provider
        }, secret, { algorithm: "HS256" });
        
        (session as any).accessToken = apiToken;
        (session.user as any).id = token.sub;
      }
      return session;
    },
    jwt: async ({ token, account, user }) => {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
