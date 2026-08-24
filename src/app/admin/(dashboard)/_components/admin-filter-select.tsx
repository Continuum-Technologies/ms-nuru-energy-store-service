"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/select";

export interface FilterOption {
  value: string;
  label: string;
}

export interface AdminFilterSelectProps {
  paramName: string;
  options: FilterOption[];
  allLabel?: string;
  className?: string;
}

export function AdminFilterSelect({
  paramName,
  options,
  allLabel = "All",
  className = "",
}: Readonly<AdminFilterSelectProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentValue = searchParams.get(paramName) || "all";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }
    params.delete("page"); // Reset pagination when filter changes

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Select
      value={currentValue}
      onChange={(e) => handleChange(e.target.value)}
      className={`h-9 text-xs border-border bg-surface text-foreground shadow-2xs font-medium cursor-pointer ${className}`}
    >
      <option value="all">{allLabel}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
