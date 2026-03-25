import Reveal from "@/app/@unauthenticated/Components/HomePage/Sections/Reveal";

const steps = [
  {
    title: "Launch an institution portal",
    description:
      "Set up your institution, branding, and access rules in minutes.",
  },
  {
    title: "Configure programs and roles",
    description:
      "Add departments, faculty, teachers, students, and academic programs.",
  },
  {
    title: "Run daily operations",
    description:
      "Manage admissions, attendance, assignments, quizzes, and results.",
  },
];

export default function StepsSection() {
  return (
    <section className="relative py-16">
      <div className="mx-auto w-full lg:max-w-[80%] px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground md:text-4xl">
              Launch a SaaS-ready campus portal in days.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Every workflow feels familiar, but faster than legacy systems. No
              heavy training required.
            </p>
          </Reveal>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Reveal key={step.title} delayMs={index * 120}>
                <div className="flex gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
                    0{index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
