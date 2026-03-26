import { Building2 } from "lucide-react";

import type { InstitutionApplication } from "@/services/Admin/institutionApplication.service";
import { formatInstitutionType } from "./utils";

type Props = {
  applications: InstitutionApplication[];
};

export default function ApplicationHistory({ applications }: Props) {
  return (
    <section className="rounded-xl border border-border/70 bg-background/70 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Application History</h2>
      </div>

      {applications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applications submitted yet.</p>
      ) : (
        <div className="space-y-2">
          {applications.map((application) => (
            <div key={application.id} className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{application.institutionName}</p>
                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs">
                  {application.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatInstitutionType(application.institutionType)} - {new Date(application.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
