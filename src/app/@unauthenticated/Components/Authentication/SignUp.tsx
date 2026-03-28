"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import SearchableSelect from "@/Components/ui/SearchableSelect";
import { signupAction } from "./auth-actions";

type SignUpProps = {
  errorMessage?: string;
  fieldErrors?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    password?: string;
  };
  fieldValues?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
};

export default function SignUp({ errorMessage, fieldErrors, fieldValues }: Readonly<SignUpProps>) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(fieldValues?.role ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const hasTypedBothPasswords = password.length > 0 && confirmPassword.length > 0;
  const passwordMismatch = useMemo(() => {
    if (!hasTypedBothPasswords) {
      return false;
    }

    return password !== confirmPassword;
  }, [confirmPassword, hasTypedBothPasswords, password]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_48%),radial-gradient(circle_at_bottom,rgba(31,111,139,0.2),transparent_50%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full gap-10  pt-10 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative order-2 lg:order-1">
            <div className="absolute -top-6 left-6 h-24 w-24 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute -bottom-10 right-10 h-28 w-28 rounded-full bg-primary/30 blur-3xl" />
            <div className="rounded-3xl border border-border/70 bg-card/80 p-8 shadow-xl backdrop-blur">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground">Create your account</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Join Biddyaloy as Admin, Teacher, or Student.
                </p>
              </div>
              <form action={signupAction} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-foreground">
                    <span>First name</span>
                    <input
                      type="text"
                      name="firstName"
                      required
                      defaultValue={fieldValues?.firstName ?? ""}
                      placeholder="Ayesha"
                      className="mt-2 w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                    {fieldErrors?.firstName ? (
                      <p className="mt-2 text-xs text-red-700">{fieldErrors.firstName}</p>
                    ) : null}
                  </label>
                  <label className="block text-sm font-medium text-foreground">
                    <span>Last name</span>
                    <input
                      type="text"
                      name="lastName"
                      required
                      defaultValue={fieldValues?.lastName ?? ""}
                      placeholder="Rahman"
                      className="mt-2 w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                    {fieldErrors?.lastName ? (
                      <p className="mt-2 text-xs text-red-700">{fieldErrors.lastName}</p>
                    ) : null}
                  </label>
                </div>
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
                  <span>Account type</span>
                  <SearchableSelect
                    name="role"
                    required
                    value={role}
                    onChange={setRole}
                    options={[
                      { value: "", label: "Select account type" },
                      { value: "ADMIN", label: "Buying a portal for my institution" },
                      { value: "TEACHER", label: "Becoming a teacher to apply" },
                      { value: "STUDENT", label: "Becoming a student to be admitted" },
                    ]}
                    placeholder="Select account type"
                    searchPlaceholder="Search account type..."
                    emptyText="No account type found"
                    className="mt-2"
                  />
                  {fieldErrors?.role ? (
                    <p className="mt-2 text-xs text-red-700">{fieldErrors.role}</p>
                  ) : null}
                </label>
                <label className="block text-sm font-medium text-foreground">
                  <span>Password</span>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Create password"
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
                <label className="block text-sm font-medium text-foreground">
                  <span>Confirm password</span>
                  <div className="relative mt-2">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter password"
                      className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordMismatch ? (
                    <p className="mt-2 text-xs text-red-700">Password and confirm password do not match</p>
                  ) : null}
                </label>
                {errorMessage ? (
                  <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                    {errorMessage}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={!hasTypedBothPasswords || passwordMismatch}
                  className="w-full cursor-pointer rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  Create account
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
                  Sign in
                </Link>
              </p>
            </div>
          </section>

          <section className="flex flex-col justify-center order-1 lg:order-2">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Ready to start
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Get started with{" "}
              <span className="block text-primary">your role-based workspace.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
              Create an account to access the right dashboard and tools for your role across
              your institution.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">Institutions onboarded</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">240+</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">Monthly active users</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">52k</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
