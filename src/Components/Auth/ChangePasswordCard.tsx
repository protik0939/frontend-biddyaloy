"use client";

import { Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  changePassword,
  type ChangePasswordFieldErrors,
} from "@/services/Authentication/password.service";

export default function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFieldErrors>({});
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setFieldErrors({});

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword, confirmNewPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast.success("Password changed successfully");
    } catch (error) {
      const fieldErrorMap =
        typeof error === "object" && error !== null && "fieldErrors" in error
          ? (error as { fieldErrors?: ChangePasswordFieldErrors }).fieldErrors
          : undefined;

      if (fieldErrorMap) {
        setFieldErrors(fieldErrorMap);
      }

      const message = error instanceof Error ? error.message : "Failed to change password";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-primary/15 p-2 text-primary">
          <LockKeyhole className="h-4 w-4" />
        </span>
        <h2 className="text-base font-semibold sm:text-lg">Change Password</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Keep your account secure by setting a strong password with uppercase, lowercase, number,
        and special character.
      </p>

      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Current Password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            placeholder="Enter current password"
            autoComplete="current-password"
          />
          {fieldErrors.currentPassword ? (
            <p className="text-xs text-destructive">{fieldErrors.currentPassword}</p>
          ) : null}
        </label>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">New Password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            {fieldErrors.newPassword ? (
              <p className="text-xs text-destructive">{fieldErrors.newPassword}</p>
            ) : null}
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Confirm New Password</span>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
            {fieldErrors.confirmNewPassword ? (
              <p className="text-xs text-destructive">{fieldErrors.confirmNewPassword}</p>
            ) : null}
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Update Password
        </button>
      </form>
    </article>
  );
}
