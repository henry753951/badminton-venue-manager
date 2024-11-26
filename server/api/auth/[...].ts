import { NuxtAuthHandler } from "#auth";
import LineProvider from "next-auth/providers/line";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";

export default NuxtAuthHandler({
  secret: useRuntimeConfig().auth_secret,
  providers: [
    // @ts-expect-error it's expected Use .default here for it to work during SSR.
    LineProvider.default({
      clientId: useRuntimeConfig().line_client_id,
      clientSecret: useRuntimeConfig().line_client_secret,
    }),
    // @ts-expect-error it's expected Use .default here for it to work during SSR.
    GoogleProvider.default({
      clientId: useRuntimeConfig().google_client_id,
      clientSecret: useRuntimeConfig().google_client_secret,
    }),
    // @ts-expect-error it's expected Use .default here for it to work during SSR.
    DiscordProvider.default({
      clientId: useRuntimeConfig().discord_client_id,
      clientSecret: useRuntimeConfig().discord_client_secret,
    }),
  ],
  callbacks: {
    /* on before signin */
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    /* on redirect to another url */
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    /* on session retrival */
    async session({ session, user, token }) {
      return session;
    },
    /* on JWT token creation or mutation */
    async jwt({ token, user, account, profile, isNewUser }) {
      return token;
    },
  },
  events: {
    async signIn(message) {
      /* on successful sign in */
    },
    async signOut(message) {
      /* on signout */
    },
    async createUser(message) {
      /* user created */
    },
    async updateUser(message) {
      /* user updated - e.g. their email was verified */
    },
    async linkAccount(message) {
      /* account (e.g. GitHub) linked to a user */
    },
    async session(message) {
      /* session is active */
    },
  },
  pages: {
    signIn: "/auth/signIn",
    signOut: "/auth/signOut",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
});
