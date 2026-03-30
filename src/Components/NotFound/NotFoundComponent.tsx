import Link from 'next/link'

export default function NotFoundComponent() {
    return (
        <section className="fixed top-0 w-full flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0"> (Design this like it would 3000 cut it as line, ans show 2800)
                <div className="absolute -left-20 top-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
            </div>

            <article className="fix w-full max-w-2xl rounded-3xl border border-border/70 bg-card/90 p-8 text-center shadow-sm backdrop-blur-md sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">404 Error</p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Page Not Found
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
                    The page you are trying to open does not exist or may have been moved. Use one of the links below to continue.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        href="/login"
                        className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary"
                    >
                        Go to Login
                    </Link>
                </div>
            </article>
        </section>
    )
}
