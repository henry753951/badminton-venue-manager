import "h3";
import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

interface User {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  roles: string[];
}

declare module "next-auth" {
  /* Returned by `useAuth`, `getSession` and `getServerSession` */
  interface Session extends DefaultSession {
    user: User;
  }
}

declare module "next-auth/jwt" {
  /* Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    user: User;
  }
}

declare module "h3" {
  interface H3EventContext {
    currentUser: {
      id: string;
      name: string;
      roles: string[];
    } | null;
  }
}
