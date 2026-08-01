import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Phone, Mail, Wrench, Calendar, DollarSign, Building, Zap, FileText, Compass, ShieldCheck } from "lucide-react";

export interface QuotationRequestDetailsProps {
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  intendedUse: string | null;
  propertyType: string | null;
  currentPowerSource: string | null;
  installationRequired: boolean;
  budgetRange: string | null;
  preferredCompletionDate: Date | null;
  customerNotes: string | null;
}

function SpecItem({
  label,
  value,
  icon: Icon,
  accent = false,
}: Readonly<{ label: string; value: string | null; icon: React.ComponentType<{ className?: string }>; accent?: boolean }>) {
  if (!value) return null;
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border p-3 transition-colors ${
        accent
          ? "border-brand-500/30 bg-brand-50/30 dark:bg-brand-600/10"
          : "border-border/70 bg-surface-muted/40"
      }`}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-brand-600 dark:bg-neutral-800 dark:text-brand-400 shrink-0 mt-0.5 shadow-2xs">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</span>
        <span className="text-xs font-bold text-foreground truncate">{value}</span>
      </div>
    </div>
  );
}

/** Read-only — customer submission specs grouped by Contact Profile and Site Specs. */
export function QuotationRequestDetails({
  customerName,
  customerPhone,
  customerEmail,
  intendedUse,
  propertyType,
  currentPowerSource,
  installationRequired,
  budgetRange,
  preferredCompletionDate,
  customerNotes,
}: Readonly<QuotationRequestDetailsProps>) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-brand-600" />
            <CardTitle className="text-base font-extrabold">Project Specifications & Customer Profile</CardTitle>
          </div>
          <span className="inline-flex items-center gap-1 rounded-pill bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700 dark:bg-brand-600/15 dark:text-brand-300">
            <ShieldCheck className="h-3 w-3" />
            Verified Customer Request
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 pt-4">
        {/* Information Group A: Contact Information */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
            Customer Profile & Direct Contact
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-brand-600 dark:bg-neutral-800 dark:text-brand-400 shrink-0 mt-0.5 shadow-2xs">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Full Name / Entity</span>
                <span className="text-xs font-bold text-foreground truncate">{customerName}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-brand-600 dark:bg-neutral-800 dark:text-brand-400 shrink-0 mt-0.5 shadow-2xs">
                <Phone className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Phone Contact</span>
                {customerPhone !== "—" ? (
                  <a href={`tel:${customerPhone}`} className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400 truncate">
                    {customerPhone}
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-neutral-400">—</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-brand-600 dark:bg-neutral-800 dark:text-brand-400 shrink-0 mt-0.5 shadow-2xs">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Address</span>
                {customerEmail ? (
                  <a href={`mailto:${customerEmail}`} className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400 truncate">
                    {customerEmail}
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-neutral-400">—</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Information Group B: Site & Engineering Requirements */}
        <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
            Site & Energy Technical Requirements
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SpecItem label="Intended Application" value={intendedUse} icon={Zap} />
            <SpecItem label="Property / Business Type" value={propertyType} icon={Building} />
            <SpecItem label="Current Power Source" value={currentPowerSource} icon={Zap} />
            <SpecItem
              label="Installation Scope"
              value={installationRequired ? "Full Turnkey Installation (EPRA Certified)" : "Hardware Supply Only"}
              icon={Wrench}
              accent={installationRequired}
            />
            <SpecItem label="Estimated Budget" value={budgetRange} icon={DollarSign} />
            <SpecItem
              label="Target Completion"
              value={preferredCompletionDate ? new Date(preferredCompletionDate).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" }) : null}
              icon={Calendar}
            />
          </div>
        </div>

        {/* Information Group C: Customer Request Notes */}
        {customerNotes && (
          <div className="flex flex-col gap-1.5 rounded-2xl border border-brand-500/20 bg-brand-50/30 p-4 dark:bg-brand-600/10 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-brand-700 dark:text-brand-300">
              <FileText className="h-4 w-4 text-brand-600" />
              <span>Customer Notes & Specific Requirements:</span>
            </div>
            <p className="text-foreground leading-relaxed italic bg-surface/50 p-2.5 rounded-xl border border-border/40">
              &quot;{customerNotes}&quot;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
