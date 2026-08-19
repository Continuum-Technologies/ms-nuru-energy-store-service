"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, Zap, Phone, ShoppingBag, FileText, ChevronRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavCategory {
  label: string;
  href: string;
}

const SOLUTION_LINKS: NavCategory[] = [
  { label: "Home Solar Systems", href: "/solutions/home-solar" },
  { label: "Farm & Irrigation Solar", href: "/solutions/farm-solar" },
  { label: "Office & Shop Backup", href: "/solutions/backup-power" },
  { label: "Water Pumping Solutions", href: "/solutions/water-pumping" },
];

export interface MobileDrawerProps {
  categoryLinks: NavCategory[];
}

const emptySubscribe = () => () => {};

/** Category links are passed in from the (server) header, which queries them live — this stays a client component only for the open/close state. */
export function MobileDrawer({ categoryLinks }: Readonly<MobileDrawerProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleDrawer = () => setIsOpen((prev) => !prev);
  const closeDrawer = () => setIsOpen(false);

  return (
    <div className="flex md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDrawer}
        aria-label="Toggle Navigation Menu"
        className="h-10 w-10 p-0 text-foreground"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Render via Portal directly to body to escape sticky header backdrop-filter containing block */}
      {isOpen && isMounted && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col bg-neutral-0 dark:bg-neutral-950 text-foreground">
          <div className="flex items-center justify-between border-b border-border p-4">
            <span className="flex items-center gap-2 text-base font-bold text-foreground">
              <Zap className="h-5 w-5 text-brand-600" />
              Nuru Energy
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDrawer}
              aria-label="Close navigation menu"
              className="h-9 w-9 p-0 text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto p-5 pb-24">
            {/* Direct Contact Banner */}
            <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Talk to an Energy Expert
              </span>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Get technical advice or custom equipment recommendations for your project.
              </p>
              <div className="mt-2 flex gap-2">
                <a
                  href="tel:+254719375096"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-control border border-border bg-surface py-2 text-xs font-semibold text-foreground shadow-2xs"
                >
                  <Phone className="h-3.5 w-3.5 text-brand-600" />
                  Call Us
                </a>
                <a
                  href="https://wa.me/254719375096"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-control bg-success-600 py-2 text-xs font-semibold text-white shadow-2xs"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Equipment Categories */}
            <div className="mb-6 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Equipment Categories
              </span>
              <div className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/70 bg-surface/50">
                {categoryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeDrawer}
                    className="flex items-center justify-between p-3 text-sm font-medium text-foreground transition-colors hover:text-brand-600"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Solar & Power Solutions */}
            <div className="mb-6 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Shop By Solution
              </span>
              <div className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/70 bg-surface/50">
                {SOLUTION_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeDrawer}
                    className="flex items-center justify-between p-3 text-sm font-medium text-foreground transition-colors hover:text-brand-600"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Core Action Links */}
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/request-quotation" onClick={closeDrawer}>
                <Button className="w-full justify-start gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4" />
                  Request a Custom Quotation
                </Button>
              </Link>
              <Link href="/cart" onClick={closeDrawer}>
                <Button variant="outline" className="w-full justify-start gap-2 text-sm font-semibold">
                  <ShoppingBag className="h-4 w-4" />
                  View Shopping Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
