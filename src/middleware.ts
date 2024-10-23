import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

// export default function middleware(request: Request) {
//   return NextResponse.next();
// }

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default auth;
