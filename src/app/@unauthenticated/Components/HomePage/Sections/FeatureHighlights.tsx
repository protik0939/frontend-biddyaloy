import Reveal from "@/app/@unauthenticated/Components/HomePage/Sections/Reveal";
import { GroupIcon, School, SearchCheck, UserKey } from "lucide-react";

const features = [
  {
    icon: <UserKey />,
    title: "Multi-role workspaces",
    description:
      "Owners, admins, faculty, teachers, and students each get a tailored view.",
  },
  {
    icon: <SearchCheck />,
    title: "Admissions and approvals",
    description:
      "Teachers and students apply to institutions and track approvals in real time.",
  },
  {
    icon: <School />,
    title: "Academic operations",
    description:
      "Manage attendance, assignments, quizzes, and results from one dashboard.",
  },
];

export default function FeatureHighlights() {
  return (
    <section id="features" className="relative py-16">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),transparent)] dark:bg-[linear-gradient(180deg,rgba(248,250,252,0.04),transparent)]" />
      <div className="relative mx-auto w-full lg:max-w-[80%] px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Features
            </p>
            <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
              Built for SaaS portal operators and institutions.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Sell portals, onboard institutions fast, and keep every academic
            workflow in one connected system.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delayMs={index * 120}>
              <div className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-black/20 transition group-hover:scale-105">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
