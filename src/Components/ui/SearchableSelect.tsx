"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableSelectOption {
  value: string;
  label: string;
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
  const [open, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

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
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-foreground outline-none ring-primary/30 transition focus:ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={selectedLabel ? "text-foreground" : "text-muted-foreground"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
          <div className="border-b border-border/70 p-2">
            <input
              value={internalSearch}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
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
                    <span>{item.label}</span>
                    {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
