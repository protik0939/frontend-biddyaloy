"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";

export interface SearchableSelectOption {
  value: string;
  label: string;
  imageUrl?: string | null;
}

type SearchableSelectProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  className?: string;
}>;

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  emptyText = "No options found",
  disabled,
  name,
  required,
  searchValue,
  onSearchValueChange,
  className,
}: SearchableSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties | null>(null);

  const selectedLabel = useMemo(() => {
    const selected = options.find((item) => item.value === value);
    return selected?.label ?? "";
  }, [options, value]);

  const internalSearch = searchValue ?? localSearch;

  const filteredOptions = useMemo(() => {
    const query = internalSearch.trim().toLowerCase();
    if (!query) {
      return options;
    }

    return options.filter((item) => item.label.toLowerCase().includes(query));
  }, [internalSearch, options]);

  const setSearch = (next: string) => {
    if (onSearchValueChange) {
      onSearchValueChange(next);
      return;
    }

    setLocalSearch(next);
  };

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideRoot = Boolean(rootRef.current?.contains(target));
      const clickedInsideDropdown = Boolean(dropdownRef.current?.contains(target));

      if (clickedInsideRoot || clickedInsideDropdown) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current) {
        return;
      }

      const rect = triggerRef.current.getBoundingClientRect();
      const viewportPadding = 12;
      const preferredHeight = 320;
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const spaceAbove = rect.top - viewportPadding;
      const shouldOpenUpward = spaceBelow < 180 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(160, Math.min(preferredHeight, shouldOpenUpward ? spaceAbove : spaceBelow));

      setDropdownStyle({
        position: "fixed",
        left: rect.left,
        top: shouldOpenUpward ? rect.top - 8 - maxHeight : rect.bottom + 8,
        width: rect.width,
        maxHeight,
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-foreground outline-none ring-primary/30 transition focus:ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex min-w-0 items-center gap-2">
          {value ? (
            options.find((item) => item.value === value)?.imageUrl ? (
              <img
                src={options.find((item) => item.value === value)?.imageUrl ?? ""}
                alt={selectedLabel || "Selected option"}
                className="h-5 w-5 rounded-full border border-border/60 object-cover"
              />
            ) : (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                {(selectedLabel || "?").charAt(0).toUpperCase()}
              </span>
            )
          ) : null}
          <span className={`truncate ${selectedLabel ? "text-foreground" : "text-muted-foreground"}`}>
            {selectedLabel || placeholder}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && dropdownStyle
        ? createPortal(
            <div
              ref={dropdownRef}
              style={dropdownStyle}
              className="overflow-hidden rounded-lg border border-border bg-background shadow-lg"
            >
              <div className="border-b border-border/70 p-2">
                <input
                  value={internalSearch}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                />
              </div>

              <div style={{ maxHeight: (dropdownStyle.maxHeight as number) - 54 }} className="overflow-y-auto py-1">
                {filteredOptions.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</p>
                ) : (
                  filteredOptions.map((item) => {
                    const isSelected = item.value === value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => handleSelect(item.value)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-foreground transition hover:bg-muted/60"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.label}
                              className="h-6 w-6 rounded-full border border-border/60 object-cover"
                            />
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                              {item.label.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <span className="truncate">{item.label}</span>
                        </span>
                        {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
