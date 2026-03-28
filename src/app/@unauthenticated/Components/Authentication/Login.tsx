"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { loginAction } from "./auth-actions";

type LoginProps = {
  errorMessage?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  fieldValues?: {
    email?: string;
  };
};

export default function Login({ errorMessage, fieldErrors, fieldValues }: Readonly<LoginProps>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_48%),radial-gradient(circle_at_bottom,rgba(31,111,139,0.2),transparent_50%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="flex flex-col justify-center pt-10">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Biddyaloy Portal
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Welcome back.{" "}
              <span className="block text-primary">Access your Biddyaloy workspace.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
              Sign in as Admin, Faculty, Department, Teacher, or Student to continue
              with your role-based dashboard and tools.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">Active portal users</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">18k+</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">Weekly platform updates</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">3.4k</p>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute -top-6 right-6 h-24 w-24 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-primary/30 blur-3xl" />
            <div className="rounded-3xl border border-border/70 bg-card/80 p-8 shadow-xl backdrop-blur">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground">Sign in</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use your registered email to access your role-specific portal.
                </p>
              </div>
              <form action={loginAction} className="space-y-5">
                <label className="block text-sm font-medium text-foreground">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={fieldValues?.email ?? ""}
                    placeholder="you@biddyaloy.edu"
                    className="mt-2 w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  {fieldErrors?.email ? (
                    <p className="mt-2 text-xs text-red-700">{fieldErrors.email}</p>
                  ) : null}
                </label>
                <label className="block text-sm font-medium text-foreground">
                  <span>Password</span>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors?.password ? (
                    <p className="mt-2 text-xs text-red-700">{fieldErrors.password}</p>
                  ) : null}
                </label>
                {errorMessage ? (
                  <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                    {errorMessage}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  Sign in
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                New here?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:text-primary/80">
                  Create an account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
