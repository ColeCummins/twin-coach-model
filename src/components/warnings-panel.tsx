import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface WarningsPanelProps {
  warnings: string[];
  className?: string;
}

export function WarningsPanel({ warnings, className }: WarningsPanelProps) {
  if (warnings.length === 0) {
    return (
      <Alert className={cn("bg-emerald-500/5 border-emerald-500/20", className)}>
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <AlertTitle className="text-emerald-600 dark:text-emerald-400">Deal Analysis Complete</AlertTitle>
        <AlertDescription className="text-emerald-600/80 dark:text-emerald-400/80">
          No significant concerns identified. Review the metrics below for detailed projections.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={cn("bg-amber-500/5 border-amber-500/20", className)}>
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-600 dark:text-amber-400">
        {warnings.length} {warnings.length === 1 ? "Consideration" : "Considerations"}
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          {warnings.map((warning, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-600/80 dark:text-amber-400/80">
              <span className="text-amber-500 mt-1">•</span>
              {warning}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
