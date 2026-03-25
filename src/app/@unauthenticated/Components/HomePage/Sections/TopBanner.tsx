import Link from "next/link";
import Reveal from "@/app/@unauthenticated/Components/HomePage/Sections/Reveal";
import Image from "next/image";

export default function TopBanner() {
    return (
        <section id="home" className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-0 flex items-center justify-center">
                <Image
                    src="/logo/BidyaloylogoIconOnly.svg"
                    alt=""
                    aria-hidden="true"
                    className="watermark-float w-[420px] opacity-[0.08] md:w-[520px]"
                    width={520}
                    height={300}
                />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,116,144,0.15),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_55%)]" />
            <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-500/15" />
            <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/15" />

            <div className="relative mx-auto grid w-full lg:max-w-[80%] gap-10 px-4 pb-16 pt-30 md:grid-cols-[1.2fr_0.8fr] md:px-6">
                <Reveal className="space-y-6">
                    <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm">
                        SaaS campus portal platform
                    </p>
                    <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                        Run every institution in one unified portal.
                    </h1>
                    <p className="max-w-xl text-base text-muted-foreground md:text-lg">
                        Sell a branded portal to institutions, then manage programs,
                        departments, faculty, teachers, and students in one calm workspace.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/login"
                            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
                        >
                            Launch your portal
                        </Link>
                        <Link
                            href="#features"
                            className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground"
                        >
                            See platform features
                        </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                        <span>Role-based access</span>
                        <span>Fast onboarding</span>
                        <span>Secure portal</span>
                    </div>
                </Reveal>

                <Reveal className="relative" delayMs={150}>
                    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card/70 shadow-2xl shadow-black/10 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2">
                        <div className="relative space-y-5">
                            <div className="relative inset-x-0 top-0 h-16 bg-linear-to-r from-primary/10 via-blue-600/10 to-transparent p-3 px-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                            Today
                                        </p>
                                        <p className="text-lg font-semibold text-foreground">
                                            Portal overview
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                                        Live
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-4 p-6 pb-0">
                                {[
                                    { label: "Applicants", value: "128 new" },
                                    { label: "Active programs", value: "42" },
                                    { label: "Portal requests", value: "7 new" },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center justify-between rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground shadow-sm"
                                    >
                                        <span>{item.label}</span>
                                        <span className="font-semibold text-foreground">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6">
                                <div className="rounded-2xl border border-border bg-foreground px-4 py-3 text-sm text-background shadow-lg shadow-black/20">
                                    One portal, every role, zero confusion.
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
