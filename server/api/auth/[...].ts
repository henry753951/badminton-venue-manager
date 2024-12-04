import { NuxtAuthHandler } from "#auth";
import LineProvider from "next-auth/providers/line";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import consola from "consola";
import { and, eq } from "drizzle-orm";
import { t_userOAuth, t_users } from "~/server/database/schema";

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  providers: [
    // @ts-expect-error it's expected Use .default here for it to work during SSR.
    LineProvider.default({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
    }),
    // @ts-expect-error it's expected Use .default here for it to work during SSR.
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // @ts-expect-error it's expected Use .default here for it to work during SSR.
    DiscordProvider.default({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
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

    /* on session retrieval */
    async session({ session, token }) {
      const db = useDb();
      const user = await db.query.t_users.findFirst({
        where: eq(t_users.id, token.user.id),
        with: {
          roles: {
            with: { role: true },
          },
        },
      });

      const roleNames = user?.roles.map((role) => role.role.name) || [];
      return {
        expires: session.expires,
        user: {
          ...token.user,
          roles: roleNames,
        },
      };
    },

    /* on JWT token creation or mutation */
    async jwt({ token, user, account, profile }) {
      const db = useDb();
      const provider = account?.provider;
      const sub = account?.providerAccountId;

      if (provider && sub) {
        // Check if user exists
        const user = await db.query.t_users.findFirst({
          where: eq(t_users.email, token?.email || ""),
          with: {
            oauth: {
              where: and(eq(t_userOAuth.provider, provider), eq(t_userOAuth.sub, sub)),
            },
            roles: {
              with: { role: true },
            },
          },
        });
        // update user profile
        if (user && user.avatar_url !== token?.picture) {
          await db
            .update(t_users)
            .set({
              avatar_url: token?.picture || "",
            })
            .where(eq(t_users.id, user.id));
          user.avatar_url = token?.picture || "";
        }

        // If user found, return the user
        if (user) {
          const { oauth, roles, ...user_ } = user;
          const roleNames = roles.map((role) => role.role.name);
          token.user = {
            ...user_,
            roles: roleNames,
          };
          return token;
        }

        // If user not found, check if user with the same email exists
        const userWithSameEmail = await db.query.t_users.findFirst({
          where: eq(t_users.email, token?.email || ""),
          with: {
            oauth: true,
            roles: {
              with: { role: true },
            },
          },
        });

        // If user with the same email found, link the account
        if (userWithSameEmail) {
          await db
            .insert(t_userOAuth)
            .values({
              user_id: userWithSameEmail.id,
              provider,
              sub,
            })
            .catch((e) => {
              consola.error(e);
            });

          const { oauth, roles, ...user_ } = userWithSameEmail;
          const roleNames = roles.map((role) => role.role.name);
          token.user = {
            ...user_,
            roles: roleNames,
          };
          return token;
        }

        // If user with the same email not found, create a new user
        if (!userWithSameEmail) {
          const [newUser] = await db
            .insert(t_users)
            .values({
              email: token?.email || "",
              name: token?.name || "",
              avatar_url: token.picture || "",
            })
            .returning();

          await db.insert(t_userOAuth).values({
            user_id: newUser.id,
            provider,
            sub,
          });
          token.user = {
            ...newUser,
            roles: [],
          };
          return { ...token };
        }
      }

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
