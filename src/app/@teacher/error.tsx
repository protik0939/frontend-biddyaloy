"use client";

import ErrorPage from "@/Components/Error/ErrorPage";

export default function TeacherError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <ErrorPage
      title="Teacher workspace unavailable"
      description="We hit a snag while loading the teacher portal. Please try again or return home."
      contextLabel="Teacher"
      error={error}
      reset={reset}
    />
  );
}
