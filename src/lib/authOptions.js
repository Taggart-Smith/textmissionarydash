import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/photoslibrary.readonly",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.access_token = account.access_token;
        token.expires_at = account.expires_at;
        token.refresh_token = account.refresh_token;
        console.log("JWT ACCESS token:", token.access_token);
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback", { session, token }); // Add this line
      session.access_token = token.access_token;
      session.expires_at = token.expires_at;
      console.log("Access token:", session.access_token);
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
