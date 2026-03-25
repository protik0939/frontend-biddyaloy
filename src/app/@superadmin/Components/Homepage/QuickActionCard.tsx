import { ArrowRight, type LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
}

export default function QuickActionCard({
  title,
  description,
  Icon,
}: Readonly<QuickActionCardProps>) {
  return (
    <button
      type="button"
      className="group w-full rounded-2xl border border-border/70 bg-card/90 p-5 text-left shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-xl bg-muted p-2 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </button>
  );
}
