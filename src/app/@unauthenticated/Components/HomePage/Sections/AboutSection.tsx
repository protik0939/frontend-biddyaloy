import Reveal from "@/app/@unauthenticated/Components/HomePage/Sections/Reveal";

const values = [
  "Role-based permissions",
  "Institution-ready workflows",
  "Scalable SaaS operations",
];

export default function AboutSection() {
  return (
    <section id="about" className="relative py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_55%)] dark:bg-[radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_55%)]" />
      <div className="relative mx-auto grid w-full lg:max-w-[80%] gap-10 px-4 md:grid-cols-[1.1fr_0.9fr] md:px-6">
        <Reveal className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            About
          </p>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
            One portal to serve every institution you manage.
          </h2>
          <p className="text-sm text-muted-foreground">
            We blend admissions, academics, and communication so leadership teams
            stay in control while teachers focus on learning.
          </p>
          <div className="mt-6 grid gap-3">
            {values.map((value) => (
              <div
                key={value}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                {value}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal
          className="rounded-3xl border border-border bg-card/80 p-6 shadow-xl shadow-black/10 backdrop-blur"
          delayMs={150}
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
              &quot;We launched a full portal for three campuses in one week.&quot;
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
              &quot;Admissions and approvals finally live in one place.&quot;
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
              &quot;Teachers and students love the clarity of the portal.&quot;
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
