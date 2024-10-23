"use client";

import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { logIn, signUp } from "@/actions/action";
import AuthFormBtn from "./auth-form-btn";
import { useFormState } from "react-dom";

type AuthFormType = {
  type: "login" | "signup";
};

export default function AuthForm({ type }: AuthFormType) {
  const [signUpError, dispatchSignup] = useFormState(signUp, undefined);
  const [loginError, dispatchLogin] = useFormState(logIn, undefined);

  return (
    <form action={type === "login" ? dispatchLogin : dispatchSignup}>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" maxLength={100}></Input>
      </div>

      <div className="mb-4 mt-2 space-y-1">
        <Label htmlFor="Password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          maxLength={100}
        ></Input>
      </div>

      <AuthFormBtn type={type} />

      {signUpError && (
        <p className="text-red-500 text-sm mt-2">{signUpError.message}</p>
      )}
      {loginError && (
        <p className="text-red-500 text-sm mt-2">{loginError.message}</p>
      )}
    </form>
  );
}
