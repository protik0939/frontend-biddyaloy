"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="app-sonner"
      position="top-right"
      expand
      richColors={false}
      closeButton
      toastOptions={{
        className:
          "border border-border/70 bg-card/95 text-card-foreground shadow-lg backdrop-blur-sm",
      }}
      {...props}
    />
  );
}
