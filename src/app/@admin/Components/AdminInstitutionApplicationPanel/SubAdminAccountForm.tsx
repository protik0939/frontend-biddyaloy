import { useMemo, useState } from "react";
import { Loader2, UserPlus2 } from "lucide-react";

import type {
  CreateInstitutionSubAdminPayload,
  InstitutionSubAdminAccountType,
} from "@/services/Admin/adminManagement.service";

type Props = Readonly<{
  accountType: InstitutionSubAdminAccountType;
  disabled?: boolean;
  title: string;
  description: string;
  onSubmit: (payload: CreateInstitutionSubAdminPayload) => Promise<void>;
}>;

function emptyCreatePayload(accountType: InstitutionSubAdminAccountType): CreateInstitutionSubAdminPayload {
  return {
    name: "",
    email: "",
    password: "",
    accountType,
  };
}

export default function SubAdminAccountForm({
  accountType,
  disabled,
  title,
  description,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CreateInstitutionSubAdminPayload>(emptyCreatePayload(accountType));
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.email.trim().length >= 5 &&
      form.password.length >= 8 &&
      !disabled
    );
  }, [disabled, form]);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      });
      setForm(emptyCreatePayload(accountType));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/70 bg-background/70 p-4">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Full Name</span>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            placeholder="Enter full name"
            disabled={disabled || submitting}
            required
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Account Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            placeholder="name@institution.edu"
            disabled={disabled || submitting}
            required
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Temporary Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            placeholder="Strong password"
            disabled={disabled || submitting}
            required
          />
          <p className="text-xs text-muted-foreground">
            At least 8 chars with uppercase, lowercase, number and special character.
          </p>
        </label>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus2 className="h-4 w-4" />}
          {submitting ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
