"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/Components/ThemeToggle";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Teachers", href: "/teacher-apply" },
  { label: "Students", href: "/student-apply" },
] as const;

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-4 z-50 px-4 md:px-6 w-full">
      <nav
        className={`relative mx-auto flex w-full p-3 lg:max-w-[90%] items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 md:px-6 ${
          isScrolled
            ? "border border-border shadow-xl shadow-black/10 backdrop-blur-xl"
            : "border border-transparent shadow-none backdrop-blur-0"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 rounded-2xl bg-background/80 transition-opacity duration-300 supports-backdrop-filter:bg-background/60 ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="relative z-10 flex w-full items-center justify-between">
        <Link href="/" className="group inline-flex items-center gap-3">
          <Image
            src="/logo/Bidyaloylogo.svg"
            alt="Biddyaloy Logo"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-cyan-600 to-blue-700 text-sm font-bold text-white shadow-lg shadow-cyan-600/30"
            width={36}
            height={36}
          />
          <span className="text-base font-semibold tracking-tight text-foreground md:text-lg">
            Biddyaloy
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-muted/60"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>

        <details className="group md:hidden">
          <summary className="list-none rounded-lg border border-border bg-card/70 px-3 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur">
            Menu
          </summary>
          <div className="absolute right-4 top-20 w-56 rounded-xl border border-border bg-background/90 p-3 shadow-xl backdrop-blur-lg">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid gap-2 border-t border-border pt-3">
              <ThemeToggle />
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-center text-sm font-semibold text-muted-foreground hover:bg-muted/60"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground"
              >
                Get Started
              </Link>
            </div>
          </div>
        </details>
        </div>
      </nav>
    </header>
  );
}
