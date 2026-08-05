"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { useTransition, useState } from "react";
import { Input } from "@/components/ui/input";

interface AdminSearchInputProps {
  placeholder?: string;
  className?: string;
}

export function AdminSearchInput({ placeholder = "Search...", className = "" }: Readonly<AdminSearchInputProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") ?? "";
  const [searchTerm, setSearchTerm] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setSearchTerm(urlQuery);
  }

  const updateSearchParam = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    params.delete("page"); // Reset pagination on search query change

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className={`relative flex-1 max-w-sm ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => updateSearchParam(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 h-9 text-xs border-border bg-surface text-foreground placeholder:text-neutral-400 focus:border-brand-500 shadow-sm"
      />
      {isPending ? (
        <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-neutral-400" />
      ) : (
        searchTerm && (
          <button
            type="button"
            onClick={() => updateSearchParam("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-0.5 rounded"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )
      )}
    </div>
  );
}
