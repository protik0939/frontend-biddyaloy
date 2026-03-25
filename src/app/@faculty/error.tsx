"use client";

import ErrorPage from "@/Components/Error/ErrorPage";

export default function FacultyError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <ErrorPage
      title="Faculty workspace unavailable"
      description="We hit a snag while loading the faculty portal. Please try again or return home."
      contextLabel="Faculty"
      error={error}
      reset={reset}
    />
  );
}
