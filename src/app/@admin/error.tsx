"use client";

import ErrorPage from "@/Components/Error/ErrorPage";

export default function AdminError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <ErrorPage
      title="Admin workspace unavailable"
      description="We hit a snag while loading the admin portal. Please try again or return home."
      contextLabel="Admin"
      error={error}
      reset={reset}
    />
  );
}
