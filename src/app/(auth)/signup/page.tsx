import AuthForm from "@/components/auth-form";
import H1 from "@/components/h1";
import Link from "next/link";

export default function Page() {
  return (
    <main>
      <H1 className="mb-5 text-center">Sign up</H1>

      <AuthForm type="signup" />

      <p className="mt-6 text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium">
          <span>Login in</span>
        </Link>
      </p>
    </main>
  );
}
