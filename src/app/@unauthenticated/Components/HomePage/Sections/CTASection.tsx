import Link from "next/link";
import Reveal from "@/app/@unauthenticated/Components/HomePage/Sections/Reveal";

export default function CTASection() {
  return (
    <section className="relative py-20">
      <div className="mx-auto w-full lg:max-w-[80%] px-4 md:px-6">
        <Reveal className="relative overflow-hidden rounded-4xl border border-border bg-card px-8 py-12 text-foreground shadow-2xl shadow-black/30">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Get started
              </p>
              <h2 className="text-3xl font-semibold md:text-4xl">
                Launch a portal for every institution you serve.
              </h2>
              <p className="text-sm text-muted-foreground">
                See how fast you can onboard, approve applicants, and run daily
                academic operations with Biddyaloy.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end md:justify-center">
              <Link
                href="/login"
                className="w-full rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 md:w-auto"
              >
                Book a walkthrough
              </Link>
              <Link
                href="/login"
                className="w-full rounded-xl border border-border px-6 py-3 text-center text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary md:w-auto"
              >
                Create an operator account
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
