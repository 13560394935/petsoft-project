import NextAuth, { NextAuthConfig } from "next-auth";
import { getUserByEmail } from "./server-utils";

export const nextAuthEdgeConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 daysW
    strategy: "jwt",
  },
  callbacks: {
    authorized: ({ auth, request }) => {
      const isLoggedIn = !!auth?.user;
      const hasAccess = isLoggedIn && auth?.user.hasAccess;
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
  providers: [],
} satisfies NextAuthConfig;

export const { auth } = NextAuth(nextAuthEdgeConfig);
