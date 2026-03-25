import Reveal from "@/app/@unauthenticated/Components/HomePage/Sections/Reveal";

const testimonials = [
  {
    quote:
      "We sell portals to institutions and everything is managed from one dashboard.",
    name: "Mira A.",
    role: "Platform Owner",
  },
  {
    quote:
      "Applications from teachers and students flow straight into approvals.",
    name: "Rahim S.",
    role: "Admissions Lead",
  },
  {
    quote:
      "Attendance, quizzes, and assignments are finally in sync across departments.",
    name: "Nadia T.",
    role: "Academic Operations",
  },
];

export default function TestimonialSection() {
  return (
    <section className="relative py-16">
      <div className="mx-auto w-full lg:max-w-[80%] px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Stories
            </p>
            <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
              Loved by portal operators and institutions.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Real teams, real outcomes. Here is what they are saying after
            launching their portal with Biddyaloy.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delayMs={index * 120}>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <p className="text-sm text-muted-foreground">&quot;{testimonial.quote}&quot;</p>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
