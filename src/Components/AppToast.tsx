"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { Toaster } from "@/Components/ui/sonner";

type ToastType = "success" | "error" | "info" | "warning";

function showToast(type: ToastType, message: string) {
  if (type === "success") {
    toast.success(message);
    return;
  }

  if (type === "error") {
    toast.error(message);
    return;
  }

  if (type === "warning") {
    toast.warning(message);
    return;
  }

  toast.info(message);
}

export default function AppToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastToastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const message = searchParams.get("toast");
    const toastTypeRaw = searchParams.get("toastType");

    if (!message) {
      return;
    }

    const toastType: ToastType =
      toastTypeRaw === "success" ||
      toastTypeRaw === "error" ||
      toastTypeRaw === "warning" ||
      toastTypeRaw === "info"
        ? toastTypeRaw
        : "success";

    const toastKey = `${pathname}:${message}:${toastType}`;
    if (lastToastKeyRef.current === toastKey) {
      return;
    }

    lastToastKeyRef.current = toastKey;
    showToast(toastType, message);

    const updatedParams = new URLSearchParams(searchParams.toString());
    updatedParams.delete("toast");
    updatedParams.delete("toastType");

    const nextUrl = updatedParams.toString()
      ? `${pathname}?${updatedParams.toString()}`
      : pathname;

    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  return <Toaster />;
}
