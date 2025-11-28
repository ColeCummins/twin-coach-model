import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  status?: "success" | "warning" | "neutral";
  icon?: React.ReactNode;
  className?: string;
  testId?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  status,
  icon,
  className,
  testId,
}: MetricCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card className={cn("overflow-hidden", className)} data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums tracking-tight" data-testid={`${testId}-value`}>
            {value}
          </span>
          {status === "success" && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
          {status === "warning" && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </div>
        {(subtitle || trendValue) && (
          <div className="flex items-center gap-2">
            {trendValue && trend && (
              <Badge
                variant="secondary"
                className={cn(
                  "px-1.5 py-0 text-xs font-medium",
                  trend === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  trend === "down" && "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}
              >
                <TrendIcon className="h-3 w-3 mr-0.5" />
                {trendValue}
              </Badge>
            )}
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StakeholderCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  metrics: {
    label: string;
    value: string;
    highlight?: boolean;
  }[];
  status?: {
    label: string;
    type: "success" | "warning" | "neutral";
  };
  testId?: string;
}

export function StakeholderCard({
  title,
  subtitle,
  icon,
  iconBg,
  metrics,
  status,
  testId,
}: StakeholderCardProps) {
  return (
    <Card className="overflow-hidden" data-testid={testId}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", iconBg)}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {status && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                status.type === "success" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                status.type === "warning" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              )}
            >
              {status.type === "success" && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {status.type === "warning" && <AlertTriangle className="h-3 w-3 mr-1" />}
              {status.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {metrics.map((metric, i) => (
            <div key={i} className={cn(metric.highlight && "col-span-2")}>
              <p className="text-xs text-muted-foreground mb-0.5">{metric.label}</p>
              <p className={cn(
                "tabular-nums",
                metric.highlight ? "text-xl font-semibold" : "text-sm font-medium"
              )}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
