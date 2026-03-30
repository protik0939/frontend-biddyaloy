"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Headphones, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  getInstitutionSubscriptionPricing,
  type InstitutionSubscriptionPricingItem,
} from "@/services/Admin/institutionApplication.service";

type PricingPlansSectionProps = {
  fullPage?: boolean;
};

export default function PricingPlansSection({ fullPage = false }: Readonly<PricingPlansSectionProps>) {
  const [plans, setPlans] = useState<InstitutionSubscriptionPricingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPlans = async () => {
      setLoading(true);
      try {
        const data = await getInstitutionSubscriptionPricing();
        if (!cancelled) {
          setPlans(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load pricing";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className={fullPage ? "mx-auto w-full max-w-6xl px-4 py-28 sm:px-6" : "mx-auto w-full max-w-6xl px-4 py-16 sm:px-6"}
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Institution Subscription Plans
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Choose the right plan for your institution</h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Activate your institution portal with secure onboarding, verified support, and ongoing subscription coverage.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {loading
            ? ["skeleton-monthly", "skeleton-half-yearly", "skeleton-yearly"].map((key) => (
              <div key={key} className="rounded-2xl border border-border/70 bg-card/80 p-5">
                <div className="h-6 w-28 animate-pulse rounded bg-muted/60" />
                <div className="mt-4 h-5 w-20 animate-pulse rounded bg-muted/60" />
                <div className="mt-2 h-8 w-32 animate-pulse rounded bg-muted/60" />
                <div className="mt-6 space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-muted/60" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-muted/60" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted/60" />
                </div>
              </div>
            ))
          : plans.map((plan) => {
              const isFeatured = plan.plan === "HALF_YEARLY";

              return (
                <article
                  key={plan.plan}
                  className={`relative rounded-2xl border p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 ${
                    isFeatured
                      ? "border-primary/50 bg-primary/5 shadow-primary/10"
                      : "border-border/70 bg-card/90"
                  }`}
                >
                  {isFeatured ? (
                    <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground">
                      Most Popular
                    </span>
                  ) : null}

                  <h3 className="text-lg font-semibold">{plan.label}</h3>
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">Original Price</p>
                  <p className="text-base text-muted-foreground line-through">{plan.originalAmount} Tk</p>
                  <p className="mt-1 text-3xl font-bold text-primary">{plan.amount} Tk</p>

                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      {plan.features[0] ?? "Institution subscription coverage"}
                    </li>
                    <li className="flex items-center gap-2">
                      <Headphones className="h-4 w-4 text-primary" />
                      {plan.support}
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Secure payment and renewal tracking
                    </li>
                  </ul>
                </article>
              );
            })}
      </div>
    </section>
  );
}
