import { Send } from "lucide-react";

import ImagebbUploader from "@/Components/ui/ImagebbUploader";
import type {
  CreateInstitutionApplicationPayload,
  InstitutionType,
} from "@/services/Admin/institutionApplication.service";
import { formatInstitutionType, institutionTypes } from "./utils";

type Props = Readonly<{
  form: CreateInstitutionApplicationPayload;
  canSubmit: boolean;
  submitting: boolean;
  mode: "create" | "reapply";
  onChange: (updater: (prev: CreateInstitutionApplicationPayload) => CreateInstitutionApplicationPayload) => void;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
}>;

export default function InstitutionApplicationForm({
  form,
  canSubmit,
  submitting,
  mode,
  onChange,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border/70 bg-background/70 p-4">
      <h2 className="text-base font-semibold">
        {mode === "reapply" ? "Reapply" : "Submit New Application"}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Institution Name</span>
          <input
            value={form.institutionName}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, institutionName: event.target.value }))
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            placeholder="Dhaka Model College"
            required
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Short Name</span>
          <input
            value={form.shortName}
            onChange={(event) => onChange((prev) => ({ ...prev, shortName: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            placeholder="DMC"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Institution Type</span>
          <select
            value={form.institutionType}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                institutionType: event.target.value as InstitutionType,
              }))
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
          >
            {institutionTypes.map((type) => (
              <option key={type} value={type}>
                {formatInstitutionType(type)}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-1 text-sm sm:col-span-2">
          <ImagebbUploader
            label="Institution logo (optional)"
            helperText="Crop to square and upload to ImageBB"
            value={form.institutionLogo}
            imageSizeMB={6}
            compressionSizeKB={250}
            cropRatio={1}
            onChange={(uploadedUrl) =>
              onChange((prev) => ({ ...prev, institutionLogo: uploadedUrl }))
            }
          />
        </div>
      </div>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Description (optional)</span>
        <textarea
          rows={4}
          value={form.description}
          onChange={(event) => onChange((prev) => ({ ...prev, description: event.target.value }))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
          placeholder="Brief introduction about the institution"
        />
      </label>

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
