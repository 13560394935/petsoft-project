import { User } from "next-auth";

declare module "@auth/core/jwt" {
  interface JWT {
    userId: string;
    user: string;
    hasAccess: boolean;
  }
}

declare module "next-auth" {
  interface User {
    email: string;
    hasAccess: boolean;
  }

  interface Session {
    user: User & {
      id: string;
    };
  }
}
