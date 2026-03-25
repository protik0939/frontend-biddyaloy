import { type LucideIcon, TrendingUp } from "lucide-react";

export interface StatItem {
  label: string;
  value: string;
  change: string;
  Icon: LucideIcon;
  subStats?: { label: string; value: string }[];
}

interface StatCardProps {
  item: StatItem;
}

export default function StatCard({ item }: Readonly<StatCardProps>) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-primary/15 p-2 text-primary">
          <item.Icon className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
          <TrendingUp className="h-3.5 w-3.5" />
          {item.change}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">{item.label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{item.value}</p>

      {item.subStats && item.subStats.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {item.subStats.map((entry) => (
            <div
              key={entry.label}
              className="rounded-lg border border-border/70 bg-background/70 px-2 py-1.5 text-center"
            >
              <p className="text-[11px] text-muted-foreground">{entry.label}</p>
              <p className="text-sm font-semibold">{entry.value}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
