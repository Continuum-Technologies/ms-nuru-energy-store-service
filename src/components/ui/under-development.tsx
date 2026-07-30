import Link from "next/link";
import { Wrench, ArrowLeft, Construction, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface UnderDevelopmentProps {
  title: string;
  description: string;
  moduleName: string;
  expectedFeatures?: string[];
}

export function UnderDevelopment({
  title,
  description,
  moduleName,
  expectedFeatures = [],
}: Readonly<UnderDevelopmentProps>) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
            <Badge tone="warning" className="text-[10px] font-semibold uppercase tracking-wider">
              In Development
            </Badge>
          </div>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>

        <Link href="/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>

      {/* Main Feature Status Card */}
      <Card className="overflow-hidden border-border/80 shadow-card">
        <CardHeader className="border-b border-border/60 bg-surface/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-700 dark:bg-warning-600/15 dark:text-warning-200 shadow-xs">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-base font-bold text-foreground">
                {moduleName} Module
              </CardTitle>
              <span className="text-xs text-neutral-500">
                Scheduled for upcoming store engineering cycle
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted/40 p-8 text-center sm:p-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-50 text-warning-700 dark:bg-warning-600/15 dark:text-warning-200">
              <Construction className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">Feature Under Active Development</h3>
            <p className="mt-1.5 max-w-md text-sm text-neutral-500 leading-relaxed">
              The {moduleName.toLowerCase()} interface is currently being built following the Nuru Energy PRD specs.
            </p>
          </div>

          {expectedFeatures.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-border/60 pt-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                <span>Planned Capabilities</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {expectedFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2.5 rounded-control border border-border/60 bg-surface/60 px-3.5 py-2.5 text-xs font-medium text-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
