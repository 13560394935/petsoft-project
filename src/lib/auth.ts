import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./server-utils";
import { authSchema } from "@/lib/validations";
const config = {
  pages: {
    signIn: "/login",
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 daysW
    strategy: "jwt",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        //validate the object by zod
        const validatedFormDataObject = authSchema.safeParse(credentials);
        if (!validatedFormDataObject.success) {
          return null;
        }

        const { email, password } = validatedFormDataObject.data;

        const user = await getUserByEmail(email);

        if (!user) {
          console.log("User not found");
          return null;
        }

        console.log("Credentials: authorize", user);

        const passwordsMatch = await bcrypt.compare(
          password,
          user.hashedPassword
        );

        if (!passwordsMatch) {
          console.log("Invalid crendentials");
          return null;
        }
        return user;
      },
    }),
  ],
  callbacks: {
    authorized: ({ auth, request }) => {
      const isLoggedIn = !!auth?.user;
      const hasAccess = auth?.user.hasAccess;
      const isTryingToAccessApp = request.nextUrl.pathname.includes("/app");

      if (!isLoggedIn && isTryingToAccessApp) {
        return false;
      }

      if (isLoggedIn && isTryingToAccessApp && !hasAccess) {
        return Response.redirect(new URL("/payment", request.nextUrl));
      }

      if (isLoggedIn && isTryingToAccessApp && hasAccess) {
        return true;
      }

      if (isLoggedIn && !isTryingToAccessApp) {
        if (
          request.nextUrl.pathname.includes("/login") ||
          request.nextUrl.pathname.includes("/signup") ||
          request.nextUrl.pathname.includes("/payment")
        ) {
          if (hasAccess) {
            return Response.redirect(
              new URL("/app/dashboard", request.nextUrl)
            );
          } else {
            if (request.nextUrl.pathname.includes("/payment")) {
              return true;
            }
            return Response.redirect(new URL("/payment", request.nextUrl));
          }
        }

        return true;
      }

      if (!isLoggedIn && !isTryingToAccessApp) {
        if (request.nextUrl.pathname.includes("/payment")) {
          return Response.redirect(new URL("/", request.nextUrl));
        }
        return true;
      }

      return false;
    },

    jwt: async ({ token, user, trigger }) => {
      if (user) {
        //on sign in
        token.userId = user.id;
        token.email = user.email;
        token.hasAccess = user.hasAccess;
      }

      if (trigger === "update") {
        const latestUser = await getUserByEmail(token.email as string);
        if (latestUser) {
          token.hasAccess = latestUser.hasAccess;
        }
      }

      return token;
    },

    session: ({ session, token }) => {
      session.user.id = token.userId;
      session.user.hasAccess = token.hasAccess;

      return session;
    },
  },
} satisfies NextAuthConfig;

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(config);
