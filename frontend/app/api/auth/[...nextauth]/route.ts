import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
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
        const apiToken = jwt.sign(token, secret, { algorithm: "HS256" });
        
        (session as any).accessToken = apiToken;
        (session.user as any).id = token.sub;
      }
      return session;
    },
    jwt: async ({ token, account, user }) => {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
