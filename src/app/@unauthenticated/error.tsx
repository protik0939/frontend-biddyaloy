"use client";

import ErrorPage from "@/Components/Error/ErrorPage";

export default function UnauthenticatedError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <ErrorPage
      title="We ran into an issue"
      description="Something went wrong while loading the portal. Please try again or return home."
      contextLabel="Public"
      error={error}
      reset={reset}
    />
  );
}
